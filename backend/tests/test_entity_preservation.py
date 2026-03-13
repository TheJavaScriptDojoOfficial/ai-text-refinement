from app.utils.entity_extractor import mask_entities, restore_entities


def test_email_and_url_preserved_round_trip():
    original = "Contact john.doe@gmail.com and open https://myapp.com/login"

    result = mask_entities(original)
    masked = result.masked_text
    entities = result.entities

    # Placeholders should be present
    assert "__EMAIL_" in masked
    assert "__URL_" in masked
    assert len(entities) >= 2

    restored = restore_entities(masked, entities)

    assert "john.doe@gmail.com" in restored
    assert "https://myapp.com/login" in restored
    assert restored == original


def test_numeric_id_preserved_round_trip():
    original = "Order ID: 993847"

    result = mask_entities(original)
    masked = result.masked_text
    entities = result.entities

    assert "__NUMBER_" in masked or "__ID_" in masked
    assert len(entities) >= 1

    restored = restore_entities(masked, entities)

    assert "993847" in restored
    assert restored == original

