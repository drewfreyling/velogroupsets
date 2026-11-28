"""Exercise commit validation against real Git histories, including merge parents."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

CHECKER = Path(__file__).resolve().parents[1] / 'check_commits.py'


class CommitHistoryTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.git('init', '-b', 'main')
        self.git('config', 'user.name', 'Commit test')
        self.git('config', 'user.email', 'test@example.invalid')
        self.git('config', 'commit.gpgsign', 'false')
        self.git('config', 'core.hooksPath', '/dev/null')
        self.base = self.commit('chore: initial commit')

    def git(self, *args):
        return subprocess.check_output(['git', *args], cwd=self.root,
                                       stderr=subprocess.DEVNULL, text=True).strip()

    def commit(self, subject):
        self.git('commit', '--allow-empty', '-m', subject)
        return self.git('rev-parse', 'HEAD')

    def merge(self, feature_subject='feat: add feature'):
        self.git('checkout', '-b', 'feature')
        feature = self.commit(feature_subject)
        self.git('checkout', 'main')
        self.commit('fix: update main')
        self.git('merge', '--no-ff', 'feature', '-m', 'Merge feature branch')
        return feature

    def check(self, event=None):
        event_path = self.root / 'event.json'
        event_path.write_text(json.dumps(event or {}))
        return subprocess.run([sys.executable, str(CHECKER)], cwd=self.root,
                              env={**os.environ, 'GITHUB_EVENT_PATH': str(event_path)},
                              capture_output=True, text=True)

    def test_real_merge_is_allowed_in_push_range_and_local_check(self):
        self.merge()
        for event in ({'before': self.base}, None):
            with self.subTest(event=event):
                result = self.check(event)
                self.assertEqual(result.returncode, 0, result.stderr)

    def test_merge_subject_does_not_exempt_an_ordinary_commit(self):
        sha = self.commit('Merge pull request #42 from example/feature')
        result = self.check({'before': self.base})
        self.assertEqual(result.returncode, 1)
        self.assertIn(sha[:12], result.stderr)

    def test_merge_does_not_hide_invalid_merged_commits(self):
        sha = self.merge('unconventional feature subject')
        result = self.check({'before': self.base})
        self.assertEqual(result.returncode, 1)
        self.assertIn(sha[:12], result.stderr)
        self.assertNotIn('Merge feature branch', result.stderr)

    def test_pr_title_still_requires_conventional_commits(self):
        self.merge()
        event = {'pull_request': {
            'title': 'Merge feature branch',
            'base': {'sha': self.base},
            'head': {'sha': self.git('rev-parse', 'HEAD')},
        }}
        result = self.check(event)
        self.assertEqual(result.returncode, 1)
        self.assertIn('PR title must use Conventional Commits format.', result.stderr)


if __name__ == '__main__':
    unittest.main()
