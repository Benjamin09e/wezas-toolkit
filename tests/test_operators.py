from wezas_core.envelope import ErrorCode
from wezas_core.operators import list_operators


def test_list_operators_all():
    env = list_operators()
    assert env.ok is True
    assert env.data["total"] > 20
    assert any(op["id"] == "airtel-ga" for op in env.data["operateurs"])


def test_list_operators_by_country():
    env = list_operators(pays="Gabon")
    assert env.ok is True
    assert env.data["pays"]["iso2"] == "GA"
    # Gabon: libertis-ga et airtel-ga
    ops = [op["id"] for op in env.data["operateurs"]]
    assert "libertis-ga" in ops
    assert "airtel-ga" in ops
    assert "orange-ci" not in ops


def test_list_operators_filter_mobile_money():
    env_all = list_operators(pays="CM")
    env_mm = list_operators(pays="CM", avec_mobile_money_seulement=True)
    assert env_all.ok is True
    assert env_mm.ok is True
    assert env_mm.data["total"] < env_all.data["total"]
    # nexttel-cm n'a pas de mobile money
    assert any(op["id"] == "nexttel-cm" for op in env_all.data["operateurs"])
    assert not any(op["id"] == "nexttel-cm" for op in env_mm.data["operateurs"])


def test_list_operators_unknown_country():
    env = list_operators(pays="Atlantide")
    assert env.ok is False
    assert env.error.code == ErrorCode.PAYS_INCONNU
