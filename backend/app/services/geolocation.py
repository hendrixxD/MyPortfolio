"""
Geolocation service for IP-based visitor tracking.
"""
import httpx
import logging
from typing import Optional, Dict, Any
from functools import lru_cache

logger = logging.getLogger(__name__)


class GeolocationService:
    """
    Service for getting geographic location from IP addresses.

    Uses ip-api.com free tier (45 requests/minute limit).
    For production with high traffic, consider upgrading to paid tier
    or using a different provider (MaxMind GeoIP2, ipstack, etc.).
    """

    BASE_URL = "http://ip-api.com/json"
    TIMEOUT = 5.0  # seconds

    @staticmethod
    @lru_cache(maxsize=1000)
    def get_location(ip_address: str) -> Optional[Dict[str, Any]]:
        """
        Get geographic location for an IP address.

        Results are cached to avoid repeated API calls for the same IP.
        Returns None if lookup fails.
        """
        if not ip_address or ip_address in ["127.0.0.1", "localhost", "::1"]:
            return {
                "country": "Local",
                "countryCode": "LC",
                "region": "Local",
                "city": "Localhost",
                "lat": 0.0,
                "lon": 0.0,
                "timezone": "UTC",
                "isp": "Local Network",
                "status": "success"
            }

        try:
            # Request specific fields to get detailed data
            fields = "status,message,country,countryCode,region,regionName,city,lat,lon,timezone,isp,org,as,query"
            url = f"{GeolocationService.BASE_URL}/{ip_address}?fields={fields}"

            with httpx.Client(timeout=GeolocationService.TIMEOUT) as client:
                response = client.get(url)
                response.raise_for_status()
                data = response.json()

                if data.get("status") == "success":
                    return data
                else:
                    logger.warning(f"Geolocation lookup failed for {ip_address}: {data.get('message')}")
                    return None

        except httpx.TimeoutException:
            logger.warning(f"Geolocation lookup timeout for {ip_address}")
            return None
        except httpx.HTTPError as e:
            logger.error(f"Geolocation HTTP error for {ip_address}: {e}")
            return None
        except Exception as e:
            logger.error(f"Geolocation error for {ip_address}: {e}")
            return None

    @staticmethod
    def clear_cache():
        """Clear the location cache."""
        GeolocationService.get_location.cache_clear()


# Singleton instance
geolocation_service = GeolocationService()
