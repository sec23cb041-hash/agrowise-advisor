import io
import numpy as np
from PIL import Image

_TARGET = (224, 224)


def prepare_image(file_bytes: bytes) -> np.ndarray:
    """Decode image bytes, resize to 224x224, normalize to [0, 1].

    Returns a numpy array of shape (1, 224, 224, 3) with dtype float32.
    Raises ValueError if the bytes cannot be decoded as a valid image.
    """
    try:
        img = Image.open(io.BytesIO(file_bytes))
        # Convert immediately — this validates the image without a separate verify()
        # call that would force a second full decode pass.
        img = img.convert("RGB")
    except Exception:
        raise ValueError("Invalid image file.")

    # Fast two-step downscale: thumbnail (nearest) then final BILINEAR resize.
    # Much faster than a single LANCZOS pass on a large source image.
    if img.width > 448 or img.height > 448:
        img.thumbnail((448, 448), Image.NEAREST)

    img = img.resize(_TARGET, Image.BILINEAR)

    arr = np.array(img, dtype=np.float32) / 255.0
    return arr[np.newaxis, ...]  # shape (1, 224, 224, 3)
