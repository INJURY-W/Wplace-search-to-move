// Based on the original script by https://greasyfork.org/en/scripts/545765-wplace-quick-search / whtepony
// Modified by INJURY, 2025
// ==UserScript==
// @name         Wplace Quick Search (Button Trigger)
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Search location and move with a button
// @match        https://wplace.live/*
// @grant        GM_xmlhttpRequest
// @connect      nominatim.openstreetmap.org
// @license MIT
// ==/UserScript==

(() => {
    const fa = document.createElement("link");
    fa.rel = "stylesheet";
    fa.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    document.head.appendChild(fa);

    const toast = msg => {
        const t = document.createElement("div");
        Object.assign(t.style, {
            position: "fixed",
            top: "60px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(255,0,0,0.50)",
            color: "#fff",
            padding: "8px 14px",
            borderRadius: "12px",
            zIndex: 9999,
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontWeight: "bold"
        });
        t.innerHTML = `<i class="fas fa-triangle-exclamation"></i>${msg}`;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 3000);
    };

    // 부모 컨테이너
    const container = document.createElement("div");
    Object.assign(container.style, {
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
    });
    document.body.appendChild(container);

    // 검색바
    const bar = document.createElement("div");
    Object.assign(bar.style, {
        background: "#edf2fa",
        borderRadius: "25px",
        padding: "6px 12px",
        border: "1px solid #e2e7ee",
        display: "flex",
        alignItems: "center",
        minWidth: "300px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        flexDirection: "column", // 버튼 세로 배치
        transition: "all 0.2s ease"
    });

    // 상단 입력 영역
	const searchRow = document.createElement("div");
	Object.assign(searchRow.style, {
		display: "flex",
		alignItems: "center",
		width: "100%",
	});

	const icon = Object.assign(document.createElement("i"), {
		className: "fas fa-search",
	});
	Object.assign(icon.style, {
		fontSize: "16px",
		marginRight: "8px",
		color: "#394e6a",
	});

	const input = Object.assign(document.createElement("input"), {
		type: "text",
		placeholder: "Search to move...",
	});
	Object.assign(input.style, {
		border: "none",
		outline: "none",
		flex: 1,
		fontSize: "14px",
		background: "transparent",
		color: "#394e6a", // 폰트 색깔 추가 (원하는 색상 코드로 변경 가능)
	});

	searchRow.append(icon, input);

    // 이동하기 버튼 (기본 숨김)
    const moveBtn = document.createElement("button");
    moveBtn.textContent = "Take me there!";
    Object.assign(moveBtn.style, {
        marginTop: "8px",
        padding: "6px 12px",
        borderRadius: "20px",
        border: "none",
        background: "#4a6cf7",
        color: "#fff",
        fontSize: "14px",
        cursor: "pointer",
        display: "none",
        width: "100%"
    });

    bar.append(searchRow, moveBtn);

    // 이동바 (드래그 핸들)
    const handle = document.createElement("div");
    Object.assign(handle.style, {
        margin: "6px auto 0 auto",
        width: "80px",
        height: "10px",
        borderRadius: "5px",
        background: "rgba(255,255,255,0.6)",
        cursor: "move",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
    });

    container.append(bar, handle);

    // 드래그 기능
    let isDragging = false, offsetX = 0, offsetY = 0;

    handle.addEventListener("mousedown", e => {
        isDragging = true;
        offsetX = e.clientX - container.offsetLeft;
        offsetY = e.clientY - container.offsetTop;
        document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", e => {
        if (!isDragging) return;
        container.style.left = `${e.clientX - offsetX}px`;
        container.style.top = `${e.clientY - offsetY}px`;
        container.style.transform = "";
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        document.body.style.userSelect = "";
    });

    // 검색 기능
    let lastCoords = null;
    const search = q => {
        GM_xmlhttpRequest({
            method: "GET",
            url: `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`,
            headers: { Accept: "application/json" },
            onload: r => {
                const d = JSON.parse(r.responseText);
                if (d?.length) {
                    lastCoords = [d[0].lat, d[0].lon];
                    moveBtn.style.display = "block"; // 버튼 표시
                    bar.style.paddingBottom = "12px"; // 세로 공간 확보
                } else {
                    toast("No results!");
                    lastCoords = null;
                    moveBtn.style.display = "none";
                }
            }
        });
    };

    moveBtn.addEventListener("click", () => {
        if (!lastCoords) return;
        const [lat, lng] = lastCoords;
        window.location.href = `https://wplace.live/?lat=${lat}&lng=${lng}&zoom=16.0869`;
    });

    input.addEventListener("keydown", e => e.key === "Enter" && input.value.trim() && search(input.value.trim()));
    icon.addEventListener("click", () => input.value.trim() && search(input.value.trim()));
})();

