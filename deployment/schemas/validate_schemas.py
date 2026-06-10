#!/usr/bin/env python3
"""
Quick validation script to test Pydantic schemas without external dependencies.

This script validates the schema structure without needing pydantic installed,
by doing basic Python syntax and import path checks.
"""

import sys
import ast
from pathlib import Path


def validate_python_syntax(file_path: Path) -> bool:
    """Validate Python file syntax."""
    try:
        with open(file_path, 'r') as f:
            ast.parse(f.read())
        print(f"✓ {file_path.name}: Syntax valid")
        return True
    except SyntaxError as e:
        print(f"✗ {file_path.name}: Syntax error at line {e.lineno}: {e.msg}")
        return False


def check_imports(file_path: Path) -> list:
    """Extract imports from Python file."""
    imports = []
    try:
        with open(file_path, 'r') as f:
            tree = ast.parse(f.read())
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        imports.append(alias.name)
                elif isinstance(node, ast.ImportFrom):
                    if node.module:
                        imports.append(node.module)
    except Exception as e:
        print(f"Warning: Could not parse imports from {file_path.name}: {e}")
    return imports


def check_class_definitions(file_path: Path) -> list:
    """Extract class definitions from Python file."""
    classes = []
    try:
        with open(file_path, 'r') as f:
            tree = ast.parse(f.read())
            for node in ast.walk(tree):
                if isinstance(node, ast.ClassDef):
                    classes.append(node.name)
    except Exception as e:
        print(f"Warning: Could not parse classes from {file_path.name}: {e}")
    return classes


def main():
    """Run validation checks."""
    print("=" * 60)
    print("Pydantic Schema Validation")
    print("=" * 60)

    schemas_dir = Path(__file__).parent
    schema_files = [
        schemas_dir / "environment.py",
        schemas_dir / "deployment.py",
        schemas_dir / "__init__.py",
        schemas_dir / "examples.py",
    ]

    # Check syntax
    print("\n1. Syntax Validation")
    print("-" * 60)
    all_valid = True
    for file_path in schema_files:
        if file_path.exists():
            if not validate_python_syntax(file_path):
                all_valid = False
        else:
            print(f"✗ {file_path.name}: File not found")
            all_valid = False

    if not all_valid:
        print("\n❌ Syntax validation failed!")
        return 1

    # Check class definitions
    print("\n2. Class Definitions")
    print("-" * 60)

    env_classes = check_class_definitions(schemas_dir / "environment.py")
    print(f"environment.py: {', '.join(env_classes)}")

    deploy_classes = check_class_definitions(schemas_dir / "deployment.py")
    print(f"deployment.py: {', '.join(deploy_classes)}")

    # Verify expected classes exist
    expected_env = {"EnvironmentConfig", "EnvironmentMetadata", "ValidationRules", "SharedConfig", "TargetConfig"}
    expected_deploy = {"DeploymentMetadata", "DeploymentResult", "GeneratedFile", "DeploymentStatus", "FileType", "ValidationError"}

    missing_env = expected_env - set(env_classes)
    missing_deploy = expected_deploy - set(deploy_classes)

    print("\n3. Required Classes Check")
    print("-" * 60)

    if missing_env:
        print(f"✗ Missing from environment.py: {missing_env}")
        all_valid = False
    else:
        print("✓ environment.py: All required classes present")

    if missing_deploy:
        print(f"✗ Missing from deployment.py: {missing_deploy}")
        all_valid = False
    else:
        print("✓ deployment.py: All required classes present")

    # Check imports
    print("\n4. Import Dependencies")
    print("-" * 60)

    env_imports = check_imports(schemas_dir / "environment.py")
    deploy_imports = check_imports(schemas_dir / "deployment.py")

    print(f"environment.py imports: {', '.join(env_imports[:5])}...")
    print(f"deployment.py imports: {', '.join(deploy_imports[:5])}...")

    # Check for pydantic
    has_pydantic_env = any('pydantic' in imp for imp in env_imports)
    has_pydantic_deploy = any('pydantic' in imp for imp in deploy_imports)

    if has_pydantic_env and has_pydantic_deploy:
        print("✓ Both files import pydantic (as expected)")
    else:
        print("✗ Pydantic imports missing")
        all_valid = False

    # Final result
    print("\n" + "=" * 60)
    if all_valid:
        print("✅ All validation checks passed!")
        print("\nNext steps:")
        print("  1. Install pydantic: pip install pydantic")
        print("  2. Test imports: python -c 'from deployment.schemas import EnvironmentConfig'")
        print("  3. Run examples: python -m deployment.schemas.examples")
    else:
        print("❌ Some validation checks failed!")
        return 1
    print("=" * 60)

    return 0


if __name__ == "__main__":
    sys.exit(main())
