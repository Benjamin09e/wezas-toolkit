import logging
import sys

import pytest
from wezas_core.log import ENV_VAR, LOGGER_NAME, configure_logging, get_logger, mask_phone


def _own_handlers():
    return [h for h in logging.getLogger(LOGGER_NAME).handlers if getattr(h, "_wezas", False)]


@pytest.fixture(autouse=True)
def _reset():
    yield
    logger = logging.getLogger(LOGGER_NAME)
    for h in _own_handlers():
        logger.removeHandler(h)


def test_logs_go_to_stderr_not_stdout(capsys):
    configure_logging("INFO")
    get_logger("x").info("bonjour")
    out, err = capsys.readouterr()
    assert out == ""
    assert "bonjour" in err


def test_default_level_is_warning(monkeypatch):
    monkeypatch.delenv(ENV_VAR, raising=False)
    assert configure_logging().level == logging.WARNING


def test_level_from_env(monkeypatch):
    monkeypatch.setenv(ENV_VAR, "debug")
    assert configure_logging().level == logging.DEBUG


def test_invalid_level_falls_back(monkeypatch):
    monkeypatch.setenv(ENV_VAR, "bavard")
    assert configure_logging().level == logging.WARNING


def test_idempotent_single_handler():
    configure_logging()
    configure_logging()
    assert len(_own_handlers()) == 1


def test_handler_targets_stderr():
    configure_logging()
    assert _own_handlers()[0].stream is sys.stderr


@pytest.mark.parametrize(
    "raw, masked",
    [("+241 06 12 34 56", "*********56"), ("123", "*23"), ("12", "***"), ("", "***")],
)
def test_mask_phone(raw, masked):
    assert mask_phone(raw) == masked
