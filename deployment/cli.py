import click
from pathlib import Path
from datetime import datetime
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from .config_loader import ConfigLoader
from .validators import EnvironmentValidator

console = Console()

# Get project root directory
PROJECT_ROOT = Path(__file__).parent.parent
ENVIRONMENTS_DIR = PROJECT_ROOT / "deployment" / "environments"
TEMPLATES_DIR = PROJECT_ROOT / "deployment" / "templates"


@click.group()
def cli():
    """Portfolio Deployment Orchestration Tool

    Generates deployment configurations from centralized TOML files,
    validates environment variables, and deploys to multiple targets.
    """
    pass


@cli.command()
@click.option('--target', type=click.Choice(['vercel', 'docker', 'cloudrun']), required=True,
              help='Deployment target platform')
@click.option('--env', required=True, help='Environment name (production, staging, development)')
@click.option('--output', default='generated', help='Output directory for generated files')
def generate(target, env, output):
    """Generate deployment configuration files."""
    console.print(f"\n[bold blue]Generating {target} configuration for {env} environment...[/bold blue]\n")

    try:
        # Load configuration
        loader = ConfigLoader(ENVIRONMENTS_DIR)
        config = loader.load_environment(env)

        # Validate configuration
        validator = EnvironmentValidator()
        is_valid, errors = validator.validate(config)

        if not is_valid:
            console.print("[bold red]Validation Failed![/bold red]\n")
            for error in errors:
                console.print(f"  [red]✗[/red] {error}")
            console.print(f"\n[yellow]Fix errors in deployment/environments/{env}.toml[/yellow]")
            raise click.Abort()

        console.print("[green]✓[/green] Configuration validated successfully")

        # Generate configs based on target
        output_dir = PROJECT_ROOT / output / target
        output_dir.mkdir(parents=True, exist_ok=True)

        # Add timestamp to config
        config['_generated_at'] = datetime.now().isoformat()

        if target == 'vercel':
            from .generators.vercel import VercelGenerator
            generator = VercelGenerator(TEMPLATES_DIR, output_dir)
            generated_files = generator.generate(config)
        elif target == 'docker':
            from .generators.docker import DockerGenerator
            generator = DockerGenerator(TEMPLATES_DIR, output_dir)
            generated_files = generator.generate(config)
        elif target == 'cloudrun':
            from .generators.cloudrun import CloudRunGenerator
            generator = CloudRunGenerator(TEMPLATES_DIR, output_dir)
            generated_files = generator.generate(config)

        # Display results
        console.print("\n[bold green]Generation Complete![/bold green]\n")
        console.print("Generated files:")
        for file_path in generated_files:
            relative_path = file_path.relative_to(PROJECT_ROOT)
            console.print(f"  [green]✓[/green] {relative_path}")

        console.print(f"\n[blue]Next steps:[/blue]")
        console.print(f"  1. Review generated files in {output}/{target}/")
        console.print(f"  2. Run: python deployment.py deploy --target {target} --env {env}")

    except FileNotFoundError as e:
        console.print(f"[red]Error:[/red] {e}")
        raise click.Abort()
    except ValueError as e:
        console.print(f"[red]Configuration Error:[/red] {e}")
        raise click.Abort()
    except Exception as e:
        console.print(f"[red]Unexpected Error:[/red] {e}")
        raise


@cli.command()
@click.option('--env', required=True, help='Environment name to validate')
def validate(env):
    """Validate environment configuration."""
    console.print(f"\n[bold blue]Validating {env} environment configuration...[/bold blue]\n")

    try:
        # Load configuration
        loader = ConfigLoader(ENVIRONMENTS_DIR)
        config = loader.load_environment(env)

        # Display environment info
        metadata = config.get('metadata', {})
        console.print(Panel(
            f"[bold]{metadata.get('name', env)}[/bold]\n"
            f"{metadata.get('description', 'No description')}\n"
            f"Targets: {', '.join(metadata.get('deployment_targets', []))}",
            title="Environment Info",
            border_style="blue"
        ))

        # Validate
        validator = EnvironmentValidator()
        is_valid, errors = validator.validate(config)

        if is_valid:
            console.print("\n[bold green]✓ Validation Passed![/bold green]\n")
            console.print("All checks passed. Configuration is ready for deployment.")
        else:
            console.print("\n[bold red]✗ Validation Failed![/bold red]\n")
            console.print("Found the following issues:\n")
            for i, error in enumerate(errors, 1):
                console.print(f"  {i}. [red]{error}[/red]")

            console.print(f"\n[yellow]Fix errors in deployment/environments/{env}.toml[/yellow]")
            raise click.Abort()

    except FileNotFoundError as e:
        console.print(f"[red]Error:[/red] {e}")
        raise click.Abort()
    except ValueError as e:
        console.print(f"[red]Configuration Error:[/red] {e}")
        raise click.Abort()
    except Exception as e:
        console.print(f"[red]Unexpected Error:[/red] {e}")
        raise


@cli.command()
@click.option('--target', type=click.Choice(['vercel', 'docker', 'cloudrun']), required=True,
              help='Deployment target platform')
@click.option('--env', required=True, help='Environment name')
@click.option('--dry-run', is_flag=True, help='Generate configs without deploying')
def deploy(target, env, dry_run):
    """Generate configs and deploy to target platform."""
    console.print(f"\n[bold blue]Deploying to {target} ({env} environment)...[/bold blue]\n")

    if dry_run:
        console.print("[yellow]DRY RUN MODE - No actual deployment will occur[/yellow]\n")

    try:
        # Step 1: Generate configs
        output_dir = PROJECT_ROOT / "generated" / target
        console.print("[bold]Step 1:[/bold] Generating deployment configs...")

        loader = ConfigLoader(ENVIRONMENTS_DIR)
        config = loader.load_environment(env)

        # Validate
        validator = EnvironmentValidator()
        is_valid, errors = validator.validate(config)

        if not is_valid:
            console.print("[bold red]Validation Failed![/bold red]\n")
            for error in errors:
                console.print(f"  [red]✗[/red] {error}")
            raise click.Abort()

        console.print("[green]✓[/green] Configuration validated")

        # Generate
        output_dir.mkdir(parents=True, exist_ok=True)
        config['_generated_at'] = datetime.now().isoformat()

        if target == 'vercel':
            from .generators.vercel import VercelGenerator
            generator = VercelGenerator(TEMPLATES_DIR, output_dir)
            generated_files = generator.generate(config)
        elif target == 'docker':
            from .generators.docker import DockerGenerator
            generator = DockerGenerator(TEMPLATES_DIR, output_dir)
            generated_files = generator.generate(config)
        elif target == 'cloudrun':
            from .generators.cloudrun import CloudRunGenerator
            generator = CloudRunGenerator(TEMPLATES_DIR, output_dir)
            generated_files = generator.generate(config)

        console.print("[green]✓[/green] Configs generated")

        # Step 2: Deploy
        if not dry_run:
            console.print("\n[bold]Step 2:[/bold] Deploying to platform...")

            if target == 'vercel':
                from .deployers.vercel import VercelDeployer
                deployer = VercelDeployer(PROJECT_ROOT)
                success = deployer.deploy(config, generated_files)
            elif target == 'docker':
                from .deployers.docker import DockerDeployer
                deployer = DockerDeployer(PROJECT_ROOT)
                success = deployer.deploy(config, generated_files)
            elif target == 'cloudrun':
                from .deployers.cloudrun import CloudRunDeployer
                deployer = CloudRunDeployer(PROJECT_ROOT)
                success = deployer.deploy(config, generated_files)

            if not success:
                console.print("\n[bold red]✗ Deployment Failed![/bold red]")
                raise click.Abort()

            console.print("\n[bold green]✓ Deployment Complete![/bold green]")
        else:
            console.print("\n[yellow]Dry run complete. Review generated files before deploying.[/yellow]")
            console.print(f"\nGenerated files in: {output_dir.relative_to(PROJECT_ROOT)}")

    except Exception as e:
        console.print(f"\n[red]Deployment Error:[/red] {e}")
        raise


@cli.command()
def list_envs():
    """List available environment configurations."""
    console.print("\n[bold blue]Available Environments[/bold blue]\n")

    try:
        # Find all TOML files
        env_files = list(ENVIRONMENTS_DIR.glob("*.toml"))
        env_files = [f for f in env_files if not f.name.startswith(".")]

        if not env_files:
            console.print("[yellow]No environment configurations found.[/yellow]")
            console.print(f"Create environment configs in: {ENVIRONMENTS_DIR}")
            return

        # Create table
        table = Table(show_header=True, header_style="bold cyan")
        table.add_column("Environment", style="green")
        table.add_column("Description")
        table.add_column("Targets")

        loader = ConfigLoader(ENVIRONMENTS_DIR)

        for env_file in sorted(env_files):
            try:
                config = loader.load_environment(env_file.stem)
                metadata = config.get('metadata', {})

                table.add_row(
                    env_file.stem,
                    metadata.get('description', 'No description'),
                    ', '.join(metadata.get('deployment_targets', []))
                )
            except Exception as e:
                table.add_row(
                    env_file.stem,
                    f"[red]Error loading: {e}[/red]",
                    ""
                )

        console.print(table)

        # Check for secrets file
        secrets_file = ENVIRONMENTS_DIR / ".secrets.toml"
        if secrets_file.exists():
            console.print("\n[green]✓[/green] .secrets.toml found")
        else:
            console.print("\n[yellow]⚠[/yellow] .secrets.toml not found - create it to resolve ${SECRET} references")

    except Exception as e:
        console.print(f"[red]Error:[/red] {e}")
        raise


if __name__ == '__main__':
    cli()
