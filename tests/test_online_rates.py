"""Tests pour le Volet 2 : Taux en ligne et résilience (WAT-043, WAT-044)."""

from unittest.mock import patch

from wezas_core.currency import convert
from wezas_core.rates_online import LiveRateResult, RatesProvider


def test_online_rates_disabled_by_default(monkeypatch):
    """Par défaut sans variable d'env, le mode hors ligne s'applique."""
    monkeypatch.delenv("WEZAS_ONLINE", raising=False)
    provider = RatesProvider()
    assert not provider.is_online_enabled
    assert provider.get_live_usd_rate() is None

    env = convert(100, "USD", "XAF")
    assert env.ok
    assert env.confiance == "moyenne"
    assert "hors ligne" in env.source.lower()


def test_online_rates_live_success(monkeypatch):
    """Quand WEZAS_ONLINE=1 et l'API répond, le taux en direct est injecté avec haute confiance."""
    monkeypatch.setenv("WEZAS_ONLINE", "1")
    provider = RatesProvider()

    mock_live = LiveRateResult(rate=1.10, date="2026-10-22", source="BCE Live Mock")

    with patch.object(provider, "get_live_usd_rate", return_value=mock_live):
        with patch("wezas_core.currency.get_live_rate_provider", return_value=provider):
            env = convert(100, "EUR", "USD")
            assert env.ok
            assert env.confiance == "haute"
            assert env.data["resultat"] == "110.00"
            assert env.source == "BCE Live Mock"
            assert len(env.avertissements) == 0


def test_online_rates_fallback_on_network_error(monkeypatch):
    """Si l'API échoue, repli transparent sur les données hors ligne avec avertissement."""
    monkeypatch.setenv("WEZAS_ONLINE", "1")
    provider = RatesProvider()

    # Simuler une panne réseau
    with patch("urllib.request.urlopen", side_effect=Exception("Network error")):
        with patch("wezas_core.currency.get_live_rate_provider", return_value=provider):
            env = convert(100, "EUR", "USD")
            assert env.ok
            assert env.confiance == "moyenne"
            assert any(w.code == "TAUX_INDICATIF_HORS_LIGNE" for w in env.avertissements)
