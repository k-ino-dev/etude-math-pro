"""
Geometry Renderer Service
Generates responsive, hand-drawn aesthetic SVG figures for geometric and analytic math exercises
(triangles, circles, orthonormal axes, vectors, function curves).
"""

import math
from typing import Dict, Any, Optional, List

class GeometryRenderer:
    """
    Constructs SVG diagrams with a natural sketched/hand-drawn look.
    """

    @staticmethod
    def render_right_triangle(
        base_label: str = "A",
        right_label: str = "B",
        top_label: str = "C",
        a_len: str = "4 cm",
        b_len: str = "3 cm",
        hyp_len: str = "5 cm",
        color: str = "#1e3a8a"
    ) -> str:
        """Generates a right-angled triangle with right angle square and side labels."""
        return f"""<svg viewBox="0 0 320 220" class="w-full max-w-sm mx-auto my-3 overflow-visible select-none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="hand-wobble" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
    </filter>
  </defs>
  <!-- Grid background subtle -->
  <rect x="10" y="10" width="300" height="200" fill="none" stroke="#e2e8f0" stroke-width="0.75" stroke-dasharray="4 4" rx="8" />
  
  <!-- Triangle path with organic hand-drawn stroke -->
  <path d="M 50 170 L 250 170 L 50 40 Z" fill="rgba(30, 58, 138, 0.04)" stroke="{color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" filter="url(#hand-wobble)" />
  
  <!-- Right angle square at B(50, 170) -->
  <path d="M 50 152 L 68 152 L 68 170" fill="none" stroke="#dc2626" stroke-width="1.8" stroke-linecap="round" />
  <circle cx="59" cy="161" r="1.5" fill="#dc2626" />
  
  <!-- Vertices labels (Handwritten font style) -->
  <text x="35" y="185" font-family="'Caveat', cursive, sans-serif" font-size="20" font-weight="bold" fill="#0f172a">{right_label}</text>
  <text x="258" y="185" font-family="'Caveat', cursive, sans-serif" font-size="20" font-weight="bold" fill="#0f172a">{base_label}</text>
  <text x="38" y="32" font-family="'Caveat', cursive, sans-serif" font-size="20" font-weight="bold" fill="#0f172a">{top_label}</text>
  
  <!-- Side lengths / labels -->
  <text x="145" y="190" font-family="'Caveat', cursive, sans-serif" font-size="16" fill="{color}" text-anchor="middle">{a_len}</text>
  <text x="28" y="110" font-family="'Caveat', cursive, sans-serif" font-size="16" fill="{color}" text-anchor="end">{b_len}</text>
  <text x="165" y="95" font-family="'Caveat', cursive, sans-serif" font-size="16" font-weight="bold" fill="#16a34a" transform="rotate(-33 165 95)">{hyp_len}</text>
</svg>"""

    @staticmethod
    def render_orthonormal_frame(
        curve_type: str = "parabola",
        f_label: str = "C_f",
        color: str = "#1e3a8a",
        highlight_color: str = "#dc2626"
    ) -> str:
        """Generates an orthonormal coordinate system (O, i, j) with a function curve."""
        return f"""<svg viewBox="0 0 340 240" class="w-full max-w-sm mx-auto my-3 overflow-visible select-none" xmlns="http://www.w3.org/2000/svg">
  <!-- Subtle grid -->
  <g stroke="#e2e8f0" stroke-width="0.8">
    <line x1="30" y1="30" x2="310" y2="30" />
    <line x1="30" y1="75" x2="310" y2="75" />
    <line x1="30" y1="120" x2="310" y2="120" />
    <line x1="30" y1="165" x2="310" y2="165" />
    <line x1="30" y1="210" x2="310" y2="210" />
    
    <line x1="75" y1="20" x2="75" y2="220" />
    <line x1="120" y1="20" x2="120" y2="220" />
    <line x1="165" y1="20" x2="165" y2="220" />
    <line x1="210" y1="20" x2="210" y2="220" />
    <line x1="255" y1="20" x2="255" y2="220" />
  </g>
  
  <!-- Axes (x and y) -->
  <line x1="25" y1="165" x2="315" y2="165" stroke="#334155" stroke-width="2" stroke-linecap="round" />
  <polyline points="310,161 318,165 310,169" fill="none" stroke="#334155" stroke-width="2" stroke-linecap="round" />
  <text x="315" y="185" font-family="'Caveat', cursive, sans-serif" font-size="18" font-weight="bold" fill="#334155">x</text>
  
  <line x1="120" y1="225" x2="120" y2="25" stroke="#334155" stroke-width="2" stroke-linecap="round" />
  <polyline points="116,30 120,22 124,30" fill="none" stroke="#334155" stroke-width="2" stroke-linecap="round" />
  <text x="105" y="25" font-family="'Caveat', cursive, sans-serif" font-size="18" font-weight="bold" fill="#334155">y</text>
  
  <!-- Origin O and unit vectors i, j -->
  <text x="108" y="182" font-family="'Caveat', cursive, sans-serif" font-size="18" font-weight="bold" fill="#0f172a">O</text>
  <line x1="120" y1="165" x2="165" y2="165" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" />
  <polyline points="160,162 166,165 160,168" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" />
  <text x="140" y="182" font-family="'Caveat', cursive, sans-serif" font-size="16" font-weight="bold" fill="#dc2626">i&#8407;</text>
  
  <line x1="120" y1="165" x2="120" y2="120" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" />
  <polyline points="117,125 120,119 123,125" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" />
  <text x="98" y="145" font-family="'Caveat', cursive, sans-serif" font-size="16" font-weight="bold" fill="#16a34a">j&#8407;</text>
  
  <!-- Parabolic / Exponential Curve -->
  <path d="M 45 40 Q 180 230 295 50" fill="none" stroke="{color}" stroke-width="2.5" stroke-linecap="round" />
  <text x="270" y="45" font-family="'Caveat', cursive, sans-serif" font-size="19" font-weight="bold" fill="{color}">({f_label})</text>
  
  <!-- Tangent line at vertex -->
  <line x1="130" y1="185" x2="230" y2="185" stroke="#f59e0b" stroke-width="1.8" stroke-dasharray="4 3" stroke-linecap="round" />
  <circle cx="180" cy="185" r="3.5" fill="#dc2626" />
  <text x="185" y="202" font-family="'Caveat', cursive, sans-serif" font-size="14" fill="#f59e0b">Tangente T</text>
</svg>"""

    @staticmethod
    def render_unit_circle(color: str = "#1e3a8a") -> str:
        """Generates a trigonometric unit circle with angles 0, pi/6, pi/4, pi/2, pi."""
        return f"""<svg viewBox="0 0 260 260" class="w-full max-w-xs mx-auto my-3 overflow-visible select-none" xmlns="http://www.w3.org/2000/svg">
  <!-- Axes -->
  <line x1="20" y1="130" x2="240" y2="130" stroke="#475569" stroke-width="1.8" stroke-linecap="round" />
  <polyline points="235,126 242,130 235,134" fill="none" stroke="#475569" stroke-width="1.8" />
  <text x="238" y="148" font-family="'Caveat', cursive, sans-serif" font-size="16" fill="#475569">cos x</text>
  
  <line x1="130" y1="240" x2="130" y2="20" stroke="#475569" stroke-width="1.8" stroke-linecap="round" />
  <polyline points="126,25 130,18 134,25" fill="none" stroke="#475569" stroke-width="1.8" />
  <text x="105" y="22" font-family="'Caveat', cursive, sans-serif" font-size="16" fill="#475569">sin x</text>
  
  <!-- Circle -->
  <circle cx="130" cy="130" r="85" fill="rgba(30, 58, 138, 0.03)" stroke="{color}" stroke-width="2.2" />
  
  <!-- Angle Ray (pi/3 or 60 deg) -->
  <line x1="130" y1="130" x2="172" y2="56" stroke="#dc2626" stroke-width="2" stroke-linecap="round" />
  <circle cx="172" cy="56" r="3.5" fill="#dc2626" />
  <text x="180" y="52" font-family="'Caveat', cursive, sans-serif" font-size="18" font-weight="bold" fill="#dc2626">M (&#960;/3)</text>
  
  <!-- Angle Arc theta -->
  <path d="M 155 130 A 25 25 0 0 0 142 108" fill="none" stroke="#16a34a" stroke-width="1.8" />
  <text x="154" y="118" font-family="'Caveat', cursive, sans-serif" font-size="16" font-weight="bold" fill="#16a34a">&#952;</text>
  
  <!-- Projections -->
  <line x1="172" y1="56" x2="172" y2="130" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3 3" />
  <line x1="172" y1="56" x2="130" y2="56" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3 3" />
  <text x="165" y="145" font-family="'Caveat', cursive, sans-serif" font-size="14" fill="#475569">1/2</text>
  <text x="92" y="60" font-family="'Caveat', cursive, sans-serif" font-size="14" fill="#475569">&#8730;3/2</text>
</svg>"""
