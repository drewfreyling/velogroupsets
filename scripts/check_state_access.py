#!/usr/bin/env python3
"""Read-only credential diagnostic; never print provider bodies or state."""
import sys
from infra import check_state_access, s3_client


def main():
    try:
        check_state_access(s3_client())
        return 0
    except (RuntimeError, ValueError) as error:
        print(str(error), file=sys.stderr)
    except Exception:
        print('State-storage preflight failed; private provider details were not logged.', file=sys.stderr)
    return 1


if __name__ == '__main__':
    sys.exit(main())
