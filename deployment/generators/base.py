from abc import ABC, abstractmethod
from pathlib import Path
from typing import Dict, Any, List


class BaseGenerator(ABC):
    """Abstract base class for deployment configuration generators."""

    def __init__(self, templates_dir: Path, output_dir: Path):
        self.templates_dir = templates_dir
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)

    @abstractmethod
    def generate(self, config: Dict[str, Any]) -> List[Path]:
        """
        Generate deployment configuration files.

        Args:
            config: Merged configuration dictionary

        Returns:
            List of generated file paths
        """
        pass

    def _merge_config(self, config: Dict, target: str) -> Dict[str, Any]:
        """
        Merge shared and target-specific configuration.

        Args:
            config: Full config dict with 'shared' and 'targets' keys
            target: Target name (e.g., 'vercel', 'docker', 'cloudrun')

        Returns:
            Merged flat configuration dictionary
        """
        merged = {}

        # Add shared vars
        if 'shared' in config:
            merged.update(self._flatten_dict(config['shared']))

        # Override with target-specific vars
        if 'targets' in config and target in config['targets']:
            merged.update(self._flatten_dict(config['targets'][target]))

        return merged

    def _flatten_dict(self, d: Dict, parent_key: str = '') -> Dict:
        """
        Flatten nested dictionary to flat key-value pairs.

        Args:
            d: Dictionary to flatten
            parent_key: Parent key for nested items (used in recursion)

        Returns:
            Flattened dictionary
        """
        items = []
        for k, v in d.items():
            if isinstance(v, dict):
                items.extend(self._flatten_dict(v).items())
            else:
                items.append((k, v))
        return dict(items)
