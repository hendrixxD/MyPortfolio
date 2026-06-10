from typing import Dict, Any, List, Tuple

class EnvironmentValidator:
    """Validates environment configurations before deployment."""

    def validate(self, config: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """
        Validate configuration.

        Returns:
            (is_valid, list_of_errors)
        """
        errors = []

        # Get validation rules from config
        validation = config.get('validation', {})
        env = config.get('shared', {}).get('ENVIRONMENT', 'development')

        # Required vars check
        required_vars = validation.get('required_vars', [])
        errors.extend(self._check_required_vars(config, required_vars))

        # No localhost in production
        if env == 'production':
            no_localhost = validation.get('no_localhost_in', [])
            errors.extend(self._check_no_localhost(config, no_localhost))

            # HTTPS required in production
            https_required = validation.get('https_required', [])
            errors.extend(self._check_https(config, https_required))

            # No empty critical vars
            no_empty = validation.get('no_empty_in_production', [])
            errors.extend(self._check_no_empty(config, no_empty))

        # CORS origins should include SITE_URL
        errors.extend(self._check_cors_includes_site_url(config))

        # Database configuration check
        errors.extend(self._check_database_config(config))

        return len(errors) == 0, errors

    def _check_required_vars(self, config: Dict, required: List[str]) -> List[str]:
        """Check required variables are present."""
        errors = []
        flat_config = self._flatten_config(config)

        for var in required:
            if var not in flat_config or not flat_config[var]:
                errors.append(f"Required variable missing or empty: {var}")

        return errors

    def _check_no_localhost(self, config: Dict, vars_to_check: List[str]) -> List[str]:
        """Check no localhost in specified variables."""
        errors = []
        flat_config = self._flatten_config(config)
        localhost_patterns = ['localhost', '127.0.0.1', '::1']

        for var in vars_to_check:
            value = str(flat_config.get(var, '')).lower()
            if any(pattern in value for pattern in localhost_patterns):
                errors.append(
                    f"{var} contains localhost in production: {flat_config.get(var)}"
                )

        return errors

    def _check_https(self, config: Dict, vars_to_check: List[str]) -> List[str]:
        """Check HTTPS is used in specified variables."""
        errors = []
        flat_config = self._flatten_config(config)

        for var in vars_to_check:
            value = flat_config.get(var, '')
            if value and not str(value).startswith('https://'):
                errors.append(f"{var} must use HTTPS in production: {value}")

        return errors

    def _check_no_empty(self, config: Dict, vars_to_check: List[str]) -> List[str]:
        """Check variables are not empty."""
        errors = []
        flat_config = self._flatten_config(config)

        for var in vars_to_check:
            if not flat_config.get(var):
                errors.append(f"{var} cannot be empty in production")

        return errors

    def _check_cors_includes_site_url(self, config: Dict) -> List[str]:
        """Check CORS origins includes SITE_URL."""
        errors = []
        flat_config = self._flatten_config(config)

        site_url = flat_config.get('SITE_URL', '')
        cors_origins = flat_config.get('CORS_ORIGINS', '')

        if site_url and site_url not in cors_origins:
            errors.append(
                f"CORS_ORIGINS should include SITE_URL: {site_url}"
            )

        return errors

    def _check_database_config(self, config: Dict) -> List[str]:
        """Check database is configured."""
        errors = []
        flat_config = self._flatten_config(config)

        has_database_url = bool(flat_config.get('DATABASE_URL'))
        has_db_components = all([
            flat_config.get('DB_HOST'),
            flat_config.get('DB_USER'),
            flat_config.get('DB_PASSWORD'),
            flat_config.get('DB_NAME')
        ])

        if not has_database_url and not has_db_components:
            errors.append(
                "Database not configured - need DATABASE_URL or DB_* components"
            )

        return errors

    def _flatten_config(self, config: Dict, parent_key: str = '') -> Dict[str, Any]:
        """Flatten nested config dict to flat key-value pairs."""
        items = []

        for k, v in config.items():
            if k in ['metadata', 'validation']:
                continue

            if isinstance(v, dict):
                items.extend(self._flatten_config(v, k).items())
            else:
                items.append((k, v))

        return dict(items)
