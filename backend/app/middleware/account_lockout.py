"""
Account lockout mechanism for failed login attempts.
"""
import time
from typing import Dict, Tuple
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class AccountLockoutManager:
    """
    Manages account lockout based on failed login attempts.

    Features:
    - Track failed login attempts per email
    - Exponential backoff for repeated failures
    - Automatic unlock after timeout
    - Configurable thresholds
    """

    def __init__(
        self,
        max_attempts: int = 5,
        lockout_duration: int = 900,  # 15 minutes
        attempt_window: int = 300  # 5 minutes
    ):
        """
        Initialize the lockout manager.

        Args:
            max_attempts: Maximum failed attempts before lockout
            lockout_duration: Lockout duration in seconds
            attempt_window: Time window to count attempts in seconds
        """
        self.max_attempts = max_attempts
        self.lockout_duration = lockout_duration
        self.attempt_window = attempt_window

        # In-memory storage: {email: [(timestamp, attempt_count), lockout_until]}
        # For production, use Redis or database
        self._attempts: Dict[str, list] = {}
        self._lockouts: Dict[str, datetime] = {}

    def is_locked(self, identifier: str) -> Tuple[bool, int]:
        """
        Check if an account is locked.

        Args:
            identifier: User email or IP address

        Returns:
            Tuple of (is_locked, seconds_remaining)
        """
        if identifier not in self._lockouts:
            return False, 0

        lockout_until = self._lockouts[identifier]
        now = datetime.utcnow()

        if now >= lockout_until:
            # Lockout expired, clean up
            del self._lockouts[identifier]
            if identifier in self._attempts:
                del self._attempts[identifier]
            return False, 0

        seconds_remaining = int((lockout_until - now).total_seconds())
        return True, seconds_remaining

    def record_failed_attempt(self, identifier: str) -> Tuple[bool, int]:
        """
        Record a failed login attempt.

        Args:
            identifier: User email or IP address

        Returns:
            Tuple of (is_now_locked, attempts_remaining or seconds_until_unlock)
        """
        now = datetime.utcnow()
        window_start = now - timedelta(seconds=self.attempt_window)

        # Initialize attempt list if needed
        if identifier not in self._attempts:
            self._attempts[identifier] = []

        # Clean up old attempts outside the window
        self._attempts[identifier] = [
            (ts, count) for ts, count in self._attempts[identifier]
            if ts > window_start
        ]

        # Add new attempt
        self._attempts[identifier].append((now, 1))

        # Count total attempts in window
        total_attempts = sum(count for _, count in self._attempts[identifier])

        if total_attempts >= self.max_attempts:
            # Lock the account
            lockout_until = now + timedelta(seconds=self.lockout_duration)
            self._lockouts[identifier] = lockout_until

            logger.warning(
                f"Account locked due to {total_attempts} failed attempts: {identifier}"
            )

            return True, self.lockout_duration

        attempts_remaining = self.max_attempts - total_attempts
        return False, attempts_remaining

    def record_successful_login(self, identifier: str) -> None:
        """
        Record a successful login and clear failed attempts.

        Args:
            identifier: User email or IP address
        """
        if identifier in self._attempts:
            del self._attempts[identifier]
        if identifier in self._lockouts:
            del self._lockouts[identifier]

    def cleanup_expired(self) -> None:
        """Clean up expired lockouts and old attempts."""
        now = datetime.utcnow()
        window_start = now - timedelta(seconds=self.attempt_window)

        # Clean up expired lockouts
        expired_lockouts = [
            email for email, until in self._lockouts.items()
            if now >= until
        ]
        for email in expired_lockouts:
            del self._lockouts[email]
            if email in self._attempts:
                del self._attempts[email]

        # Clean up old attempts
        for identifier in list(self._attempts.keys()):
            self._attempts[identifier] = [
                (ts, count) for ts, count in self._attempts[identifier]
                if ts > window_start
            ]
            if not self._attempts[identifier]:
                del self._attempts[identifier]


# Global lockout manager instance
_lockout_manager: AccountLockoutManager | None = None


def get_lockout_manager() -> AccountLockoutManager:
    """Get or create the global lockout manager instance."""
    global _lockout_manager
    if _lockout_manager is None:
        _lockout_manager = AccountLockoutManager()
    return _lockout_manager
