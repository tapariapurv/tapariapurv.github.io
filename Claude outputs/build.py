#!/usr/bin/env python3
"""Purv Taparia - Resume builder.

Source of truth. Edit the content lists below, then run:
    python3 build.py            -> writes resume.html
    (WeasyPrint renders resume.html -> "Purv Taparia - Resume.pdf")

Rules (learned the hard way):
  * NO emoji anywhere - they render as boxes in WeasyPrint. Icons are inline SVG (Bootstrap Icons) via ic().
  * SVG fill is written as an attribute; WeasyPrint ignores `fill: currentColor` in CSS.
  * No CSS Grid except .proj-grid (grid crashed / mis-measured elsewhere). Body is a table so headers align.
  * Font stack 'Inter','Lato',sans-serif - Lato must be installed locally or layout spills to 3 pages.
  * Page 1 has almost no slack: measure page count after every change.
"""
import html, re

# ---------------------------------------------------------------- colours
AC, DIM, CORAL, GOLD, CC = "#0b6478", "#6b7c94", "#b83e1e", "#9b7508", "#5b47b8"
INK, BODY, LINE = "#0d1b2e", "#3a4a60", "#dde3ec"

# ---------------------------------------------------------------- icons (Bootstrap Icons, MIT)
P = {
    'mortarboard-fill': '<path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917z"/> <path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466z"/>',
    'code-slash': '<path d="M10.478 1.647a.5.5 0 1 0-.956-.294l-4 13a.5.5 0 0 0 .956.294zM4.854 4.146a.5.5 0 0 1 0 .708L1.707 8l3.147 3.146a.5.5 0 0 1-.708.708l-3.5-3.5a.5.5 0 0 1 0-.708l3.5-3.5a.5.5 0 0 1 .708 0m6.292 0a.5.5 0 0 0 0 .708L14.293 8l-3.147 3.146a.5.5 0 0 0 .708.708l3.5-3.5a.5.5 0 0 0 0-.708l-3.5-3.5a.5.5 0 0 0-.708 0"/>',
    'pencil-fill': '<path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>',
    'geo-alt': '<path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10"/> <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>',
    'envelope-fill': '<path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z"/>',
    'linkedin': '<path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"/>',
    'github': '<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>',
    'globe': '<path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.5-6.923c-.67.204-1.335.82-1.887 1.855A8 8 0 0 0 5.145 4H7.5zM4.09 4a9.3 9.3 0 0 1 .64-1.539 7 7 0 0 1 .597-.933A7.03 7.03 0 0 0 2.255 4zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a7 7 0 0 0-.656 2.5zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5zM8.5 5v2.5h2.99a12.5 12.5 0 0 0-.337-2.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5zM5.145 12q.208.58.468 1.068c.552 1.035 1.218 1.65 1.887 1.855V12zm.182 2.472a7 7 0 0 1-.597-.933A9.3 9.3 0 0 1 4.09 12H2.255a7 7 0 0 0 3.072 2.472M3.82 11a13.7 13.7 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5zm6.853 3.472A7 7 0 0 0 13.745 12H11.91a9.3 9.3 0 0 1-.64 1.539 7 7 0 0 1-.597.933M8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855q.26-.487.468-1.068zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.7 13.7 0 0 1-.312 2.5m2.802-3.5a7 7 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7 7 0 0 0-3.072-2.472c.218.284.418.598.597.933M10.855 4a8 8 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4z"/>',
    'youtube': '<path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z"/>',
    'award-fill': '<path d="m8 0 1.669.864 1.858.282.842 1.68 1.337 1.32L13.4 6l.306 1.854-1.337 1.32-.842 1.68-1.858.282L8 12l-1.669-.864-1.858-.282-.842-1.68-1.337-1.32L2.6 6l-.306-1.854 1.337-1.32.842-1.68L6.331.864z"/> <path d="M4 11.794V16l4-1 4 1v-4.206l-2.018.306L8 13.126 6.018 12.1z"/>',
    'book-fill': '<path d="M8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783"/>',
    'lightning-fill': '<path d="M5.52.359A.5.5 0 0 1 6 0h4a.5.5 0 0 1 .474.658L8.694 6H12.5a.5.5 0 0 1 .395.807l-7 9a.5.5 0 0 1-.873-.454L6.823 9.5H3.5a.5.5 0 0 1-.48-.641z"/>',
    'trophy-fill': '<path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5q0 .807-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89A33 33 0 0 1 2.5.5m.099 2.54a2 2 0 0 0 .72 3.935c-.333-1.05-.588-2.346-.72-3.935m10.083 3.935a2 2 0 0 0 .72-3.935c-.133 1.59-.388 2.885-.72 3.935"/>',
    'person-fill': '<path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>',
    'briefcase-fill': '<path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v1.384l7.614 2.03a1.5 1.5 0 0 0 .772 0L16 5.884V4.5A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5"/> <path d="M0 12.5A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5V6.85L8.129 8.947a.5.5 0 0 1-.258 0L0 6.85z"/>',
    'patch-check-fill': '<path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01zm.287 5.984-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708.708"/>',
    'gear-fill': '<path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>',
    'bank2': '<path d="M8.277.084a.5.5 0 0 0-.554 0l-7.5 5A.5.5 0 0 0 .5 6h1.875v7H1.5a.5.5 0 0 0 0 1h13a.5.5 0 1 0 0-1h-.875V6H15.5a.5.5 0 0 0 .277-.916zM12.375 6v7h-1.25V6zm-2.5 0v7h-1.25V6zm-2.5 0v7h-1.25V6zm-2.5 0v7h-1.25V6zM8 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2M.5 15a.5.5 0 0 0 0 1h15a.5.5 0 1 0 0-1z"/>',
    'amazon': '<path d="M10.813 11.968c.157.083.36.074.5-.05l.005.005a90 90 0 0 1 1.623-1.405c.173-.143.143-.372.006-.563l-.125-.17c-.345-.465-.673-.906-.673-1.791v-3.3l.001-.335c.008-1.265.014-2.421-.933-3.305C10.404.274 9.06 0 8.03 0 6.017 0 3.77.75 3.296 3.24c-.047.264.143.404.316.443l2.054.22c.19-.009.33-.196.366-.387.176-.857.896-1.271 1.703-1.271.435 0 .929.16 1.188.55.264.39.26.91.257 1.376v.432q-.3.033-.621.065c-1.113.114-2.397.246-3.36.67C3.873 5.91 2.94 7.08 2.94 8.798c0 2.2 1.387 3.298 3.168 3.298 1.506 0 2.328-.354 3.489-1.54l.167.246c.274.405.456.675 1.047 1.166ZM6.03 8.431C6.03 6.627 7.647 6.3 9.177 6.3v.57c.001.776.002 1.434-.396 2.133-.336.595-.87.961-1.465.961-.812 0-1.286-.619-1.286-1.533M.435 12.174c2.629 1.603 6.698 4.084 13.183.997.28-.116.475.078.199.431C13.538 13.96 11.312 16 7.57 16 3.832 16 .968 13.446.094 12.386c-.24-.275.036-.4.199-.299z"/> <path d="M13.828 11.943c.567-.07 1.468-.027 1.645.204.135.176-.004.966-.233 1.533-.23.563-.572.961-.762 1.115s-.333.094-.23-.137c.105-.23.684-1.663.455-1.963-.213-.278-1.177-.177-1.625-.13l-.09.009q-.142.013-.233.024c-.193.021-.245.027-.274-.032-.074-.209.779-.556 1.347-.623"/>',
    'send-fill': '<path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z"/>',
    'robot': '<path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5M3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.6 26.6 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.93.93 0 0 1-.765.935c-.845.147-2.34.346-4.235.346s-3.39-.2-4.235-.346A.93.93 0 0 1 3 9.219zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a25 25 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25 25 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135"/> <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2zM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5"/>',
    'cpu': '<path d="M5 0a.5.5 0 0 1 .5.5V2h1V.5a.5.5 0 0 1 1 0V2h1V.5a.5.5 0 0 1 1 0V2h1V.5a.5.5 0 0 1 1 0V2A2.5 2.5 0 0 1 14 4.5h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14a2.5 2.5 0 0 1-2.5 2.5v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14A2.5 2.5 0 0 1 2 11.5H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2A2.5 2.5 0 0 1 4.5 2V.5A.5.5 0 0 1 5 0m-.5 3A1.5 1.5 0 0 0 3 4.5v7A1.5 1.5 0 0 0 4.5 13h7a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 11.5 3zM5 6.5A1.5 1.5 0 0 1 6.5 5h3A1.5 1.5 0 0 1 11 6.5v3A1.5 1.5 0 0 1 9.5 11h-3A1.5 1.5 0 0 1 5 9.5zM6.5 6a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5z"/>',
    'database': '<path d="M4.318 2.687C5.234 2.271 6.536 2 8 2s2.766.27 3.682.687C12.644 3.125 13 3.627 13 4c0 .374-.356.875-1.318 1.313C10.766 5.729 9.464 6 8 6s-2.766-.27-3.682-.687C3.356 4.875 3 4.373 3 4c0-.374.356-.875 1.318-1.313M13 5.698V7c0 .374-.356.875-1.318 1.313C10.766 8.729 9.464 9 8 9s-2.766-.27-3.682-.687C3.356 7.875 3 7.373 3 7V5.698c.271.202.58.378.904.525C4.978 6.711 6.427 7 8 7s3.022-.289 4.096-.777A5 5 0 0 0 13 5.698M14 4c0-1.007-.875-1.755-1.904-2.223C11.022 1.289 9.573 1 8 1s-3.022.289-4.096.777C2.875 2.245 2 2.993 2 4v9c0 1.007.875 1.755 1.904 2.223C4.978 15.71 6.427 16 8 16s3.022-.289 4.096-.777C13.125 14.755 14 14.007 14 13zm-1 4.698V10c0 .374-.356.875-1.318 1.313C10.766 11.729 9.464 12 8 12s-2.766-.27-3.682-.687C3.356 10.875 3 10.373 3 10V8.698c.271.202.58.378.904.525C4.978 9.71 6.427 10 8 10s3.022-.289 4.096-.777A5 5 0 0 0 13 8.698m0 3V13c0 .374-.356.875-1.318 1.313C10.766 14.729 9.464 15 8 15s-2.766-.27-3.682-.687C3.356 13.875 3 13.373 3 13v-1.302c.271.202.58.378.904.525C4.978 12.71 6.427 13 8 13s3.022-.289 4.096-.777c.324-.147.633-.323.904-.525"/>',
    'bar-chart-fill': '<path d="M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z"/>',
    'terminal-fill': '<path d="M0 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm9.5 5.5h-3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1m-6.354-.354a.5.5 0 1 0 .708.708l2-2a.5.5 0 0 0 0-.708l-2-2a.5.5 0 1 0-.708.708L4.793 6.5z"/>',
    'gear-wide-connected': '<path d="M7.068.727c.243-.97 1.62-.97 1.864 0l.071.286a.96.96 0 0 0 1.622.434l.205-.211c.695-.719 1.888-.03 1.613.931l-.08.284a.96.96 0 0 0 1.187 1.187l.283-.081c.96-.275 1.65.918.931 1.613l-.211.205a.96.96 0 0 0 .434 1.622l.286.071c.97.243.97 1.62 0 1.864l-.286.071a.96.96 0 0 0-.434 1.622l.211.205c.719.695.03 1.888-.931 1.613l-.284-.08a.96.96 0 0 0-1.187 1.187l.081.283c.275.96-.918 1.65-1.613.931l-.205-.211a.96.96 0 0 0-1.622.434l-.071.286c-.243.97-1.62.97-1.864 0l-.071-.286a.96.96 0 0 0-1.622-.434l-.205.211c-.695.719-1.888.03-1.613-.931l.08-.284a.96.96 0 0 0-1.186-1.187l-.284.081c-.96.275-1.65-.918-.931-1.613l.211-.205a.96.96 0 0 0-.434-1.622l-.286-.071c-.97-.243-.97-1.62 0-1.864l.286-.071a.96.96 0 0 0 .434-1.622l-.211-.205c-.719-.695-.03-1.888.931-1.613l.284.08a.96.96 0 0 0 1.187-1.186l-.081-.284c-.275-.96.918-1.65 1.613-.931l.205.211a.96.96 0 0 0 1.622-.434zM12.973 8.5H8.25l-2.834 3.779A4.998 4.998 0 0 0 12.973 8.5m0-1a4.998 4.998 0 0 0-7.557-3.779l2.834 3.78zM5.048 3.967l-.087.065zm-.431.355A4.98 4.98 0 0 0 3.002 8c0 1.455.622 2.765 1.615 3.678L7.375 8zm.344 7.646.087.065z"/>',
    'laptop': '<path d="M13.5 3a.5.5 0 0 1 .5.5V11H2V3.5a.5.5 0 0 1 .5-.5zm-11-1A1.5 1.5 0 0 0 1 3.5V12h14V3.5A1.5 1.5 0 0 0 13.5 2zM0 12.5h16a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 12.5"/>',
    'calculator-fill': '<path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zm2 .5v2a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5h-7a.5.5 0 0 0-.5.5m0 4v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5M4.5 9a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM4 12.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5M7.5 6a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM7 9.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5m.5 2.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM10 6.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5m.5 2.5a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5z"/>',
    'speedometer2': '<path d="M8 4a.5.5 0 0 1 .5.5V6a.5.5 0 0 1-1 0V4.5A.5.5 0 0 1 8 4M3.732 5.732a.5.5 0 0 1 .707 0l.915.914a.5.5 0 1 1-.708.708l-.914-.915a.5.5 0 0 1 0-.707M2 10a.5.5 0 0 1 .5-.5h1.586a.5.5 0 0 1 0 1H2.5A.5.5 0 0 1 2 10m9.5 0a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 1 0 1H12a.5.5 0 0 1-.5-.5m.754-4.246a.39.39 0 0 0-.527-.02L7.547 9.31a.91.91 0 1 0 1.302 1.258l3.434-4.297a.39.39 0 0 0-.029-.518z"/> <path fill-rule="evenodd" d="M0 10a8 8 0 1 1 15.547 2.661c-.442 1.253-1.845 1.602-2.932 1.25C11.309 13.488 9.475 13 8 13c-1.474 0-3.31.488-4.615.911-1.087.352-2.49.003-2.932-1.25A8 8 0 0 1 0 10m8-7a7 7 0 0 0-6.603 9.329c.203.575.923.876 1.68.63C4.397 12.533 6.358 12 8 12s3.604.532 4.923.96c.757.245 1.477-.056 1.68-.631A7 7 0 0 0 8 3"/>',
    'shield-fill-check': '<path fill-rule="evenodd" d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.8 11.8 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7 7 0 0 0 1.048-.625 11.8 11.8 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.54 1.54 0 0 0-1.044-1.263 63 63 0 0 0-2.887-.87C9.843.266 8.69 0 8 0m2.146 5.146a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793z"/>',
    'circle-fill': '<circle cx="8" cy="8" r="8"/>',
    'hammer': '<path d="M9.972 2.508a.5.5 0 0 0-.16-.556l-.178-.129a5 5 0 0 0-2.076-.783C6.215.862 4.504 1.229 2.84 3.133H1.786a.5.5 0 0 0-.354.147L.146 4.567a.5.5 0 0 0 0 .706l2.571 2.579a.5.5 0 0 0 .708 0l1.286-1.29a.5.5 0 0 0 .146-.353V5.57l8.387 8.873A.5.5 0 0 0 14 14.5l1.5-1.5a.5.5 0 0 0 .017-.689l-9.129-8.63c.747-.456 1.772-.839 3.112-.839a.5.5 0 0 0 .472-.334"/>',
    'square-fill': '<path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2z"/>',
    'flag-fill': '<path d="M14.778.085A.5.5 0 0 1 15 .5V8a.5.5 0 0 1-.314.464L14.5 8l.186.464-.003.001-.006.003-.023.009a12 12 0 0 1-.397.15c-.264.095-.631.223-1.047.35-.816.252-1.879.523-2.71.523-.847 0-1.548-.28-2.158-.525l-.028-.01C7.68 8.71 7.14 8.5 6.5 8.5c-.7 0-1.638.23-2.437.477A20 20 0 0 0 3 9.342V15.5a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 1 0v.282c.226-.079.496-.17.79-.26C4.606.272 5.67 0 6.5 0c.84 0 1.524.277 2.121.519l.043.018C9.286.788 9.828 1 10.5 1c.7 0 1.638-.23 2.437-.477a20 20 0 0 0 1.349-.476l.019-.007.004-.002h.001"/>',
    'dot': '<path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/>',
}


def ic(name, color=AC, size=9):
    """Inline SVG icon; fill written as an attribute on every shape (WeasyPrint needs this)."""
    inner = re.sub(r'<(path|circle|rect)\b', r'<\1 fill="%s"' % color, P[name])
    return (f'<svg class="ic" width="{size}pt" height="{size}pt" viewBox="0 0 16 16" '
            f'xmlns="http://www.w3.org/2000/svg">{inner}</svg>')


e = html.escape

# ---------------------------------------------------------------- content
PROFILE = {
    "name": "Purv Taparia",
    "tags": [("mortarboard-fill", "Student"), ("code-slash", "Coder"),
             ("pencil-fill", "Author &amp; Blogger"), ("geo-alt", "Mumbai, India")],
    "summary": (
        "Grade 5 student at Chatrabhuj Narsee School, Mumbai. Programs in HTML, CSS, JavaScript, Python "
        "and C++, and builds web apps with React, TypeScript, Next.js and Firebase. Designs and solders "
        "Arduino and ESP8266 hardware &mdash; a playable NeoPixel game, an air quality monitor, a radar "
        "system and a live stock-market alert device. Holds four certifications: Arduino Junior (96%), "
        "Claude 101, Claude Code 101 and Claude Code in Action (perfect 8/8). Published 5 books on Amazon and Bribooks, won "
        "International Rank 1 in the English Olympiad twice, and competes at national level in roller skating."
    ),
}

CONTACT = [
    ("envelope-fill", "tapariapurv+portfolio@gmail.com", "mailto:tapariapurv+portfolio@gmail.com"),
    ("linkedin", "linkedin.com/in/purv-taparia", "https://linkedin.com/in/purv-taparia"),
    ("github", "github.com/tapariapurv", "https://github.com/tapariapurv"),
    ("globe", "tapariapurv.github.io", "https://tapariapurv.github.io"),
    ("youtube", "youtube.com/@decodewithpurv", "https://youtube.com/@decodewithpurv"),
    ("pencil-fill", "tapariapurv.beehiiv.com", "https://tapariapurv.beehiiv.com"),
]

STATS = [
    ("award-fill", "#1", "International Rank"),
    ("book-fill", "5", "Books Published"),
    ("lightning-fill", "96%", "Arduino Score"),
    ("trophy-fill", "&#8377;50K", "IEO Prize Won"),
]

ACH = [
    ("award-fill", "International English Olympiad (IEO &middot; SOF)",
     "Int'l Rank 1: Grade 1 &amp; Grade 3 Level 1 (40/40) &middot; School Rank 1: Grade 2 (39/40) &middot; "
     "Won &#8377;50,000: Grade 3 Level 2 (40/40, Int'l Rank 1)"),
    ("laptop", "ICSO / National Cyber Olympiad", "Int'l Rank 2, Grade 3 &middot; 39/40 marks &middot; Won &#8377;8,333"),
    ("calculator-fill", "Mathematics &middot; IPM Mega-Final",
     "94th Rank, All-India Open Mathematics Scholarship Exam, Grade 2"),
    ("speedometer2", "Roller Athletics",
     "District 3rd (Mumbai Suburban) &middot; State 5th (Maharashtra) &middot; National 5th"),
]

SKILLS = [
    ("code-slash", "Code", "HTML &amp; CSS &middot; JavaScript &middot; Python &middot; C++ &middot; Block Coding"),
    ("globe", "Web", "React &middot; TypeScript &middot; Next.js &middot; Tailwind CSS &middot; GSAP &middot; Vite"),
    ("cpu", "Hardware", "Arduino &middot; ESP8266 &middot; NeoPixels &middot; Sensors &middot; Breadboards &amp; LEDs"),
    ("robot", "AI", "Claude / Anthropic &middot; Veo 3.1 &middot; Nano Banana Pro &middot; Prompt Engineering"),
    ("database", "Backend", "Firebase &middot; SQLite &middot; REST APIs &middot; GitHub Pages &middot; Vercel"),
    ("bar-chart-fill", "Productivity", "Excel (formulas, macros) &middot; PowerPoint"),
    ("pencil-fill", "Writing", "Descriptive stories &middot; Essays &middot; Newsletter (Beehiiv) &middot; 5 published books"),
]

BOOKS = [
    ("10-Year-Old's Decode the Stock Market", "Amazon", "https://www.amazon.in/dp/B0H1YGCL2D"),
    ("Dubai and a Futuristic City", "Bribooks", "https://www.bribooks.com/bookstore/dubai-and-a-futuristic-city"),
    ("The Tour to DigiDream", "Bribooks", "https://bribooks.com/bookstore/the-tour-to-digidream-by-purv-taparia"),
    ("Five Stories by Purv Taparia", "Bribooks", "https://www.bribooks.com/bookstore/5-stories-by-purv-taparia/"),
    ("Graduation Day", "Bribooks", "https://www.bribooks.com/bookstore/graduation-day-6479ed2fbb7fb/"),
]

CERT_BASE = "https://tapariapurv.github.io/assets/"
CERTS = [
    ("lightning-fill", "Arduino Junior Certification", "Arduino Official", "Passed with <b>96%</b>",
     [("View", CERT_BASE + "Arduino%20Junior%20Certification.pdf")]),
    ("patch-check-fill", "Claude 101 Certification", "Anthropic Academy",
     "Claude Projects, AI workflows &amp; productivity",
     [("View", CERT_BASE + "Claude%20101%20Certificate.pdf")]),
    ("terminal-fill", "Claude Code 101 Certification", "Anthropic Academy",
     "Plan Mode, subagents, skills, MCP &amp; hooks",
     [("View", CERT_BASE + "Claude%20Code%20101%20Certificate.pdf"),
      ("Verify", "https://verify.skilljar.com/c/hdh53pci5vhz")]),
    ("robot", "Claude Code in Action", "Anthropic Academy", "Perfect <b>8/8</b> quiz score",
     [("View", CERT_BASE + "Claude%20Code%20in%20Action%20Certificate.pdf"),
      ("Verify", "https://verify.skilljar.com/c/ghgqrf8euxh7")]),
]

EXP = [
    ("pencil-fill", "Author &amp; Self-Publisher", "Independent", "Mar 2025 &ndash; May 2026",
     "Researched, wrote and published <i>10-Year-Old's Decode the Stock Market</i> for young readers, "
     "then produced YouTube Shorts to market it."),
    ("send-fill", "Newsletter Writer", "Beehiiv", "2025 &ndash; Present",
     "Publishes essays on projects, writing and learning."),
    ("github", "Open-Source Maintainer", "GitHub", "2026 &ndash; Present",
     "Maintains Envoy, Indian Stock Data Hub, LiteWarden and Antigravity Usage Monitor as public repositories."),
]

EDU = [
    ("bank2", "Chatrabhuj Narsee School", "Student &middot; Grade 5", "2019 &ndash; Present",
     "Spanish, French, STEM coursework and Microsoft Office."),
    ("gear-wide-connected", "MakerWorks Lab", "Robotics Programme", "Nov 2024 &ndash; Present",
     "Micro:Bit basics through Arduino UNO builds and schematic design for multi-component circuits."),
    ("terminal-fill", "freeCodeCamp", "Python &middot; Computer Programming", "May &ndash; Aug 2026",
     "Variables, conditionals, loops, functions and data structures."),
]

# badges: "live", "hw", "prog", "cc"
PROJ = [
    ("flag-fill", "Envoy", ["live", "cc"], "September 2026",
     "Private, local-first AI workspace for Model UN delegates: chats with research documents with "
     "citations, drafts position papers for Word or PDF, simulates an opposing delegation, and runs "
     "committee timers. Fully offline via Ollama.",
     ["Next.js", "FastAPI", "ChromaDB", "Ollama"],
     ("github", "github.com/tapariapurv/envoy", "https://github.com/tapariapurv/envoy")),
    ("calculator-fill", "Indian Stock Data Hub", ["live", "cc"], "September 2026",
     "Streamlit research desk for Indian listed companies: scrapes ratios and filings, extracts every "
     "figure from the PDFs, and exports Excel and Word reports. Optional AI runs fully offline via Ollama.",
     ["Python", "Streamlit", "Ollama", "pdfplumber"],
     ("github", "github.com/tapariapurv/indian-stock-data-hub", "https://github.com/tapariapurv/indian-stock-data-hub")),
    ("cpu", "Neo-Pixel Game", ["hw"], "January 2026",
     "Playable 8&times;8 NeoPixel grid game with piezo buzzer, rechargeable battery and 3D-printed enclosure.",
     ["Arduino", "C++", "NeoPixels"],
     ("github", "github.com/tapariapurv/neopixel-game", "https://github.com/tapariapurv/neopixel-game")),
    ("gear-fill", "Air Quality Monitor", ["hw"], "November 2025",
     "Portable AQI monitor built during Delhi's air crisis: MQ135 gas sensor, 128&times;64 OLED and "
     "Arduino Nano in a custom enclosure.",
     ["Arduino", "C++", "Sensors"],
     ("youtube", "Watch on YouTube", "https://youtube.com/shorts/qGbcmELwwhQ")),
    ("send-fill", "Radar System", ["hw"], "May 2026",
     "Arduino UNO radar using an ultrasonic sensor for signal processing and real-time object detection.",
     ["Arduino", "C++", "Ultrasonic"],
     ("youtube", "Watch on YouTube", "https://youtube.com/shorts/xNrgtW_awv8")),
    ("bar-chart-fill", "Market Alert Matrix", ["hw"], "August 2026",
     "ESP8266 device with a 16-LED NeoPixel ring showing live market movement &mdash; one LED per 0.2% "
     "move, piezo alarm past 1%.",
     ["ESP8266", "C++", "NeoPixels", "APIs"], None),
    ("book-fill", "Logek", ["live", "cc"], "August 2026",
     "Adaptive vocabulary app using Bayesian skill estimation and SM-2 spaced repetition, with MCQ "
     "challenges, XP, streaks and unlockable themes.",
     ["React", "TypeScript", "Firebase", "Tailwind"],
     ("globe", "tapariapurv.github.io/Logek", "https://tapariapurv.github.io/Logek")),
    ("database", "Antigravity Usage Monitor", ["live", "cc"], "June 2026",
     "Read-only analytics dashboard for Google Antigravity tracking sessions, token usage, subagents and "
     "estimated API costs with activity heatmaps.",
     ["Next.js", "TypeScript", "SQLite", "Tailwind"],
     ("github", "github.com/tapariapurv/antigravity-usage-monitor", "https://github.com/tapariapurv/antigravity-usage-monitor")),
    ("shield-fill-check", "LiteWarden", ["prog", "cc"], "January 2026",
     "Local-first Chrome extension for on-device password management and autofill. Nothing leaves the "
     "browser. Free and open source.",
     ["JavaScript", "Chrome APIs", "HTML/CSS"],
     ("github", "github.com/tapariapurv/chrome-extension", "https://github.com/tapariapurv/chrome-extension")),
    ("globe", "Velvet Pour", ["live"], "August 2026",
     "GSAP-animated cocktail brand landing page with scroll-triggered timelines and SplitText reveals, "
     "built in React and deployed on Vercel.",
     ["React", "GSAP", "Tailwind", "Vite"],
     ("globe", "cocktail-site-lac.vercel.app", "https://cocktail-site-lac.vercel.app/")),
    ("robot", "Rapid Games", ["live"], "October 2025",
     "Free browser gaming platform with a hand-picked collection of curated games. Built and maintained "
     "collaboratively with Ridit and Devansh.",
     ["HTML", "CSS", "JavaScript", "GitHub Pages"],
     ("globe", "tapariapurv.github.io/rapidgames", "https://tapariapurv.github.io/rapidgames")),
]

# ---------------------------------------------------------------- CSS
CSS = f"""
@page {{ size: A4; margin: 10mm 10mm 9mm 10mm; }}
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
body {{ font-family: 'Inter', 'Lato', sans-serif; font-size: 8.1pt; color: {BODY}; line-height: 1.45; }}
a {{ color: {AC}; text-decoration: none; }}
b {{ font-weight: 700; }}
svg.ic {{ vertical-align: -1.2pt; }}

.hdr {{ border: 0.8pt solid {LINE}; border-radius: 10pt; padding: 17pt 16pt 17pt 17pt;
        display: flex; justify-content: space-between; align-items: center; }}
.hdr h1 {{ font-size: 24.8pt; font-weight: 800; color: {INK}; letter-spacing: -0.9pt; line-height: 1.1; }}
.tags {{ margin-top: 5pt; font-size: 8.6pt; font-weight: 500; color: {AC}; }}
.tags .sep {{ color: {DIM}; font-weight: 400; padding: 0 3pt; }}
.contact {{ text-align: right; font-size: 7.9pt; line-height: 1.92; }}
.contact svg.ic {{ margin-right: 3pt; }}

.stats {{ display: flex; margin: 6pt -2.5pt 6pt -2.5pt; }}
.stat {{ flex: 1; margin: 0 2.5pt; border: 0.8pt solid {LINE}; border-radius: 8pt; text-align: center;
         padding: 8pt 4pt 7pt 4pt; }}
.stat .v {{ font-size: 16.5pt; font-weight: 800; color: {AC}; line-height: 1.15; }}
.stat .l {{ font-size: 6pt; font-weight: 600; color: {DIM}; letter-spacing: 1.1pt; text-transform: uppercase; }}

h2 {{ font-size: 6.4pt; font-weight: 700; color: {AC}; letter-spacing: 2pt; text-transform: uppercase;
      border-bottom: 1.3pt solid {AC}; padding: 0 0 3pt 1pt; margin-bottom: 5pt; }}
h2 svg.ic {{ margin-right: 4pt; vertical-align: -1pt; }}

table.body-tbl {{ width: 100%; border-collapse: collapse; table-layout: fixed; }}
table.body-tbl > tbody > tr > td {{ vertical-align: top; padding: 0 0 5pt 0; }}
table.body-tbl td.l {{ width: 56.5%; padding-right: 6pt; }}
table.body-tbl td.r {{ width: 43.5%; padding-left: 6pt; }}
p.sum {{ text-align: justify; line-height: 1.62; }}

.book {{ border-bottom: 0.5pt solid #edf1f6; padding: 3.2pt 0 3.3pt 0; }}
.book:last-child {{ border-bottom: none; }}
.book a {{ font-weight: 600; }}
.book .st {{ float: right; font-size: 6.9pt; color: {DIM}; padding-top: 1pt; }}

.item {{ display: flex; margin-bottom: 7pt; }}
.item .i {{ width: 15pt; flex: none; padding-top: 1pt; }}
.item .t {{ font-size: 7.9pt; font-weight: 700; color: {INK}; }}
.item .m {{ font-size: 7.2pt; color: {AC}; }}
.item .m .d {{ color: {DIM}; }}
.item .x {{ font-size: 7.2pt; line-height: 1.5; }}
.cert .t {{ font-size: 8.1pt; }}
.cert .m, .cert .x {{ font-size: 7.3pt; }}
.cert {{ margin-bottom: 7pt; }}

table.skills {{ width: 100%; border-collapse: collapse; }}
table.skills td {{ border-bottom: 0.5pt solid #e6ebf2; padding: 2.3pt 0; font-size: 7.7pt; vertical-align: middle; }}
table.skills tr:last-child td {{ border-bottom: none; }}
table.skills td.k {{ width: 24%; font-size: 6.6pt; font-weight: 700; color: {DIM}; letter-spacing: 0.8pt;
                     text-transform: uppercase; }}
table.skills td.k svg.ic {{ margin-right: 3pt; }}

.ach {{ margin-top: 1pt; }}
.ach .row {{ display: flex; margin-bottom: 7pt; font-size: 7.6pt; }}
.ach .row .i {{ width: 15pt; flex: none; }}
.ach .row b {{ font-size: 8.2pt; color: {INK}; }}

.p2 {{ page-break-before: always; }}
.proj-grid {{ display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6pt; }}
.card {{ border: 0.8pt solid {LINE}; border-radius: 7pt; padding: 9pt 10pt 9pt 10pt; }}
.card .t {{ font-size: 9.1pt; font-weight: 700; color: {INK}; }}
.card .t svg.ic {{ margin-right: 3pt; }}
.card .dt {{ font-size: 7.3pt; color: {DIM}; margin: 1pt 0 4pt 0; }}
.card .x {{ line-height: 1.6; margin-bottom: 5pt; }}
.badge {{ display: inline-block; font-size: 6.4pt; font-weight: 600; border-radius: 8pt; padding: 1pt 5pt 1.3pt 5pt;
          border: 0.7pt solid; margin-left: 2pt; vertical-align: 1pt; white-space: nowrap; }}
.badge svg.ic {{ margin-right: 2pt; vertical-align: -0.5pt; }}
.b-live {{ color: {AC}; background: #e9f3f5; border-color: #9cc6cf; }}
.b-hw {{ color: {CORAL}; background: #fbeee9; border-color: #e7b0a1; }}
.b-prog {{ color: {GOLD}; background: #faf4df; border-color: #dfcc8f; }}
.b-cc {{ color: {CC}; background: #efedfb; border-color: #bdb3ea; }}
.tag {{ display: inline-block; font-size: 7pt; color: {DIM}; background: #f3f6fa; border: 0.6pt solid #dfe5ee;
        border-radius: 3pt; padding: 1.5pt 5pt; margin: 0 2pt 4pt 0; }}
.card .lk {{ font-size: 7.3pt; font-weight: 600; margin-top: 1pt; }}
.card .lk svg.ic {{ margin-right: 3pt; }}
"""


# ---------------------------------------------------------------- builders
def header():
    tags = '<span class="sep">&middot;</span>'.join(
        f'{ic(i, AC, 8.6)} {t}' for i, t in PROFILE["tags"])
    contact = "<br>".join(f'<a href="{u}">{ic(i, AC, 8)}{e(t)}</a>' for i, t, u in CONTACT)
    return (f'<div class="hdr"><div><h1>{PROFILE["name"]}</h1><div class="tags">{tags}</div></div>'
            f'<div class="contact">{contact}</div></div>')


def stats():
    return '<div class="stats">' + "".join(
        f'<div class="stat">{ic(i, AC, 11)}<div class="v">{v}</div><div class="l">{l}</div></div>'
        for i, v, l in STATS) + "</div>"


def h2(icon, title):
    return f'<h2>{ic(icon, AC, 7.5)}{title}</h2>'


def item(icon, title, org, date, desc, cls=""):
    return (f'<div class="item {cls}"><div class="i">{ic(icon, AC, 9.5)}</div><div>'
            f'<div class="t">{title}</div><div class="m">{org} &middot; <span class="d">{date}</span></div>'
            f'<div class="x">{desc}</div></div></div>')


def books():
    out = []
    for t, store, u in BOOKS:
        si = ic("amazon" if store == "Amazon" else "book-fill", DIM, 7)
        out.append(f'<div class="book"><span class="st">{si} {store}</span><a href="{u}">{e(t)}</a></div>')
    return "".join(out)


def certs():
    out = []
    for i, t, org, desc, links in CERTS:
        lk = " &middot; ".join(f'<a href="{u}">{n} &rarr;</a>' for n, u in links)
        out.append(f'<div class="item cert"><div class="i">{ic(i, AC, 9.5)}</div><div>'
                   f'<div class="t">{t}</div><div class="m">{org}</div>'
                   f'<div class="x">{desc} &middot; {lk}</div></div></div>')
    return "".join(out)


def skills():
    rows = "".join(f'<tr><td class="k">{ic(i, AC, 7)}{k}</td><td>{v}</td></tr>' for i, k, v in SKILLS)
    return f'<table class="skills">{rows}</table>'


def edu():
    return "".join(
        f'<div class="item cert"><div class="i">{ic(i, AC, 9.5)}</div><div>'
        f'<div class="t">{t}</div><div class="m">{org} &middot; <span class="d">{d}</span></div>'
        f'<div class="x">{x}</div></div></div>' for i, t, org, d, x in EDU)


def body():
    exp = "".join(item(*x) for x in EXP)
    rows = [
        (h2("person-fill", "Profile") + f'<p class="sum">{PROFILE["summary"]}</p>',
         h2("book-fill", "Published Books") + books()),
        (h2("briefcase-fill", "Experience") + exp, h2("patch-check-fill", "Certifications") + certs()),
        (h2("gear-fill", "Skills") + skills(), h2("bank2", "Education") + edu()),
    ]
    return '<table class="body-tbl">' + "".join(
        f'<tr><td class="l">{l}</td><td class="r">{r}</td></tr>' for l, r in rows) + "</table>"


def achievements():
    rows = "".join(f'<div class="row"><div class="i">{ic(i, AC, 9.5)}</div><div><b>{t}</b> '
                   f'<span style="color:{DIM}">&mdash;</span> {d}</div></div>' for i, t, d in ACH)
    return h2("trophy-fill", "Achievements") + f'<div class="ach">{rows}</div>'


BADGE = {
    "live": ("b-live", "circle-fill", AC, "Live"),
    "hw": ("b-hw", "cpu", CORAL, "Hardware"),
    "prog": ("b-prog", "hammer", GOLD, "In Progress"),
    "cc": ("b-cc", "terminal-fill", CC, "Claude Code"),
}


def projects():
    cards = []
    for icon, name, badges, date, desc, tags, link in PROJ:
        bs = "".join(f'<span class="badge {c}">{ic(bi, col, 5.5 if bi == "circle-fill" else 6.5)}{lab}</span>'
                     for c, bi, col, lab in (BADGE[b] for b in badges))
        tg = "".join(f'<span class="tag">{t}</span>' for t in tags)
        lk = (f'<div class="lk"><a href="{link[2]}">{ic(link[0], AC, 7.5)}{e(link[1])}</a></div>'
              if link else "")
        cards.append(f'<div class="card"><div class="t">{ic(icon, AC, 9.5)}{name} {bs}</div>'
                     f'<div class="dt">{date}</div><div class="x">{desc}</div><div>{tg}</div>{lk}</div>')
    return (f'<div class="p2">{h2("dot", "Projects")}<div class="proj-grid">' + "".join(cards) + "</div></div>")


def build():
    doc = f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>Purv Taparia &mdash; Resume</title>
<meta name="description" content="Purv Taparia - student, coder and 5x published author from Mumbai, India.">
<style>{CSS}</style></head><body>
{header()}
{stats()}
{body()}
{achievements()}
{projects()}
</body></html>"""
    with open("resume.html", "w", encoding="utf-8") as f:
        f.write(doc)
    print("wrote resume.html", len(doc), "bytes")


if __name__ == "__main__":
    build()
