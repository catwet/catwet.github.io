"""Build a tiny Catweb page with the raw Python helpers."""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from catweb.raw import folder, frame, save, text_button, text_label


page = folder(
    frame(
        text_label(
            "Hola, Catweb",
            size="{1, 0},{0.2, 0}",
            font_size="scaled",
            align_x="Center",
            align_y="Center",
            rich="false",
        ),
        text_button(
            "Explorar",
            size="{0.4, 0},{0.15, 0}",
            background_color="#4e9bff",
            font_size="scaled",
            align_x="Center",
            align_y="Center",
            auto_color="true",
        ),
        size="{1, 0},{1, 0}",
        background_color="#ffffff",
    )
)

if __name__ == "__main__":
    destination = ROOT / "examples" / "projects" / "hello_catweb.json"
    save(page, destination)
    print(f"Entregable creado: {destination}")
