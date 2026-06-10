import os
import re
from pathlib import Path
from typing import Dict, Any
import tomli  # pip install tomli

class ConfigLoader:
    """Loads environment configs from TOML files and resolves secrets."""

    def __init__(self, environments_dir: Path):
        self.environments_dir = environments_dir
        self.secrets = self._load_secrets()

    def _load_secrets(self) -> Dict[str, str]:
        """Load secrets from .secrets.toml."""
        secrets_file = self.environments_dir / ".secrets.toml"
        if not secrets_file.exists():
            return {}

        with open(secrets_file, 'rb') as f:
            return tomli.load(f)

    def load_environment(self, env_name: str) -> Dict[str, Any]:
        """Load environment config and resolve secret references."""
        env_file = self.environments_dir / f"{env_name}.toml"

        if not env_file.exists():
            raise FileNotFoundError(
                f"Environment config not found: {env_file}\n"
                f"Available: {self._list_environments()}"
            )

        with open(env_file, 'rb') as f:
            config = tomli.load(f)

        # Resolve secret references ${VAR_NAME}
        return self._resolve_secrets(config)

    def _resolve_secrets(self, config: Any) -> Any:
        """Recursively resolve ${VAR_NAME} references."""
        if isinstance(config, dict):
            return {k: self._resolve_secrets(v) for k, v in config.items()}
        elif isinstance(config, list):
            return [self._resolve_secrets(item) for item in config]
        elif isinstance(config, str):
            # Match ${VAR_NAME} pattern
            pattern = r'\$\{([A-Z_]+)\}'

            def replacer(match):
                var_name = match.group(1)
                if var_name not in self.secrets:
                    raise ValueError(
                        f"Secret not found: {var_name}\n"
                        f"Add it to .secrets.toml"
                    )
                return self.secrets[var_name]

            return re.sub(pattern, replacer, config)
        else:
            return config

    def _list_environments(self) -> list:
        """List available environment configs."""
        return [
            f.stem for f in self.environments_dir.glob("*.toml")
            if not f.name.startswith(".")
        ]
