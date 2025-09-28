// ==========================================
// SCRIPT 2: EXTRACTOR MULTI-VERSIÓN CORREGIDO
// Extrae partidas de TODAS las versiones del deck
// Verifica que no se pierdan datos de ninguna versión
// ==========================================

(function() {
    'use strict';
    
    console.clear();
    console.log('%c📊 EXTRACTOR MULTI-VERSIÓN MTG ARENA', 'color: #28a745; font-size: 18px; font-weight: bold;');
    console.log('Asegurando extracción de TODAS las versiones del deck');
    console.log('='*60);
    
    // =========================
    // DIAGNÓSTICO INICIAL
    // =========================
    console.log('\n🔍 DIAGNÓSTICO PRE-EXTRACCIÓN:');
    
    // Buscar indicadores de versiones
    const versionHeaders = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        return text.match(/Version \d+Created \d+ day/);
    });
    
    console.log(`  Versiones del deck detectadas: ${versionHeaders.length}`);
    
    // Buscar secciones Play History
    const playHistoryElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent === 'Play History' && !el.querySelector('*')
    );
    
    console.log(`  Secciones "Play History": ${playHistoryElements.length}`);
    
    // Contar sesiones expandidas vs no expandidas
    const hideMatchesCount = document.querySelectorAll('*:not(:has(*))').length && 
        Array.from(document.querySelectorAll('*')).filter(el => 
            el.textContent === 'Hide Matches' && !el.querySelector('*')
        ).length;
    
    const showMatchesCount = document.querySelectorAll('*:not(:has(*))').length && 
        Array.from(document.querySelectorAll('*')).filter(el => 
            el.textContent === 'Show Matches' && !el.querySelector('*')
        ).length;
    
    console.log(`  Sesiones expandidas (Hide Matches): ${hideMatchesCount}`);
    console.log(`  Sesiones sin expandir (Show Matches): ${showMatchesCount}`);
    
    if (showMatchesCount > 0) {
        console.warn(`\n⚠️ ADVERTENCIA: Hay ${showMatchesCount} sesiones sin expandir`);
        console.warn('  Recomendación: Ejecuta el SCRIPT 1 (EXPANSOR) primero\n');
    }
    
    // =========================
    // EXTRACCIÓN DE PARTIDAS - MEJORADA
    // =========================
    console.log('\n🎲 EXTRAYENDO PARTIDAS DE TODAS LAS VERSIONES:');
    
    // Método 1: Buscar TODOS los elementos li con la clase específica
    let todasLasPartidas = Array.from(document.querySelectorAll("li.sc-16524a9a-0"));
    console.log(`  Elementos <li> totales encontrados: ${todasLasPartidas.length}`);
    
    // Filtrar los que tienen información de resultado
    let partidasConResultado = todasLasPartidas.filter(li => li.querySelector(".result-info"));
    console.log(`  Partidas con información de resultado: ${partidasConResultado.length}`);
    
    // Método 2 (Backup): Si no encuentra suficientes, buscar de otra forma
    if (partidasConResultado.length === 0) {
        console.log('\n  Intentando método alternativo de búsqueda...');
        
        // Buscar por otros selectores posibles
        const alternativeSelectors = [
            'li[class*="game"]',
            'li[class*="match"]',
            'li[class*="history"]',
            'div[class*="game-item"]',
            'div[class*="match-item"]'
        ];
        
        for (const selector of alternativeSelectors) {
            const elementos = document.querySelectorAll(selector);
            if (elementos.length > 0) {
                console.log(`    Encontrados ${elementos.length} elementos con selector: ${selector}`);
                const conResultado = Array.from(elementos).filter(el => 
                    el.querySelector('.result-info') || 
                    el.textContent.includes('WIN') || 
                    el.textContent.includes('LOSS')
                );
                if (conResultado.length > partidasConResultado.length) {
                    partidasConResultado = conResultado;
                }
            }
        }
    }
    
    const partidas = partidasConResultado;
    
    // Analizar de qué versiones son las partidas
    console.log('\n📋 ANÁLISIS DE VERSIONES:');
    
    const partidasPorVersion = {
        'Version 1': 0,
        'Version 2': 0,
        'Sin versión identificada': 0
    };
    
    partidas.forEach(p => {
        let parent = p;
        let versionFound = false;
        let depth = 0;
        
        // Buscar hacia arriba en el DOM para encontrar la versión
        while (parent && depth < 15) {
            const text = parent.textContent || '';
            if (text.includes('Version 1Created')) {
                partidasPorVersion['Version 1']++;
                versionFound = true;
                break;
            } else if (text.includes('Version 2Created')) {
                partidasPorVersion['Version 2']++;
                versionFound = true;
                break;
            }
            parent = parent.parentElement;
            depth++;
        }
        
        if (!versionFound) {
            partidasPorVersion['Sin versión identificada']++;
        }
    });
    
    console.table(partidasPorVersion);
    
    if (partidasPorVersion['Version 1'] === 0 && partidasPorVersion['Version 2'] > 0) {
        console.warn('\n⚠️ ALERTA: Solo se encontraron partidas de Version 2');
        console.warn('  La Version 1 puede no estar expandida correctamente');
    } else if (partidasPorVersion['Version 2'] === 0 && partidasPorVersion['Version 1'] > 0) {
        console.warn('\n⚠️ ALERTA: Solo se encontraron partidas de Version 1');
        console.warn('  La Version 2 puede no estar expandida correctamente');
    }
    
    if (partidas.length === 0) {
        console.error('\n❌ No se encontraron partidas');
        console.log('Posibles causas:');
        console.log('1. Las secciones no están expandidas (ejecuta SCRIPT 1 primero)');
        console.log('2. Los selectores han cambiado');
        console.log('3. No hay partidas en este deck');
        return;
    }
    
    // =========================
    // PROCESAMIENTO DE DATOS
    // =========================
    console.log('\n⚙️ PROCESANDO DATOS DE PARTIDAS:');
    
    // OBTENER INFORMACIÓN DEL DECK
    console.log('\n🎯 Buscando información del deck...');
    let deckInfo = "";
    let deckCode = "";
    
    // Función auxiliar para buscar deck code
    function findDeckCode() {
        // Buscar patrón AAQ que es como empiezan los deck codes
        const deckPattern = /AAQ[A-Za-z0-9_-]{20,}/;
        
        // Método 1: Buscar en botones
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
            const textContent = btn.textContent || '';
            const onclick = btn.getAttribute('onclick') || '';
            const ariaLabel = btn.getAttribute('aria-label') || '';
            
            for (const text of [textContent, onclick, ariaLabel]) {
                const match = text.match(deckPattern);
                if (match) return match[0];
            }
        }
        
        // Método 2: Buscar en enlaces
        const links = document.querySelectorAll('a');
        for (const link of links) {
            const href = link.href || '';
            const match = href.match(deckPattern);
            if (match) return match[0];
        }
        
        // Método 3: Buscar en elementos de copia/compartir
        const shareElements = document.querySelectorAll('[class*="copy"], [class*="share"], [class*="export"]');
        for (const el of shareElements) {
            const text = el.textContent || '';
            const match = text.match(deckPattern);
            if (match) return match[0];
        }
        
        // Método 4: Buscar en el HTML completo (último recurso)
        const pageHTML = document.body.innerHTML;
        const globalMatch = pageHTML.match(deckPattern);
        if (globalMatch) return globalMatch[0];
        
        // Método 5: Buscar si fue guardado previamente
        if (window.currentDeckCode) return window.currentDeckCode;
        
        return null;
    }
    
    // Buscar el deck code
    deckCode = findDeckCode();
    
    if (deckCode) {
        deckInfo = `https://mtga.untapped.gg/decks/${deckCode}`;
        console.log(`  ✅ Deck code encontrado: ${deckCode}`);
        console.log(`  URL del deck: ${deckInfo}`);
    } else {
        // Si no encuentra el deck code, usar la URL actual como fallback
        const currentUrl = window.location.href;
        const urlMatch = currentUrl.match(/\/deck\/([a-f0-9-]+)/);
        if (urlMatch) {
            deckInfo = `Deck UUID: ${urlMatch[1]}`;
            console.log(`  ⚠️ Deck code no encontrado, usando UUID: ${urlMatch[1]}`);
        } else {
            deckInfo = "No deck info";
            console.log('  ❌ No se pudo extraer información del deck');
            console.log('  Tip: Ejecuta el script "Buscador de Deck Code" para intentar encontrarlo');
        }
    }
    
    const datos = [];
    let errores = 0;
    
    partidas.forEach((p, idx) => {
        try {
            // RESULTADO
            const resultado = (p.querySelector("span.result-info")?.getAttribute("result") || "").toUpperCase();
            
            // COLORES
            const colorMap = {
                'White': 'W', 'white': 'W',
                'Blue': 'U', 'blue': 'U',
                'Black': 'B', 'black': 'B',
                'Red': 'R', 'red': 'R',
                'Green': 'G', 'green': 'G'
            };
            
            const coloresSet = new Set();
            p.querySelectorAll(".ms-cost").forEach(el => {
                const label = (el.getAttribute("aria-label") || "").trim();
                const color = colorMap[label] || colorMap[label.toLowerCase()];
                if (color) coloresSet.add(color);
            });
            
            const colores = ['W', 'U', 'B', 'R', 'G'].filter(c => coloresSet.has(c)).join('');
            
            // OPONENTE
            const oponente = p.querySelector("a b")?.textContent.trim() || "";
            
            // POSICIÓN
            const playDrawText = (p.querySelector(".sc-2953075a-2")?.textContent || "").toLowerCase();
            const posicion = playDrawText.includes("play") ? "play" : 
                           playDrawText.includes("draw") ? "draw" : "";
            
            // RANKINGS
            const rankElems = p.querySelectorAll(".sc-30f008df-3");
            const rankInicial = rankElems[0]?.textContent.trim() || "";
            const rankFinal = rankElems[1]?.textContent.trim() || (rankInicial ? "?" : "");
            
            // DURACIÓN
            let duracion = "";
            const clockParent = p.querySelector(".fa-clock")?.parentElement;
            if (clockParent) {
                const match = clockParent.textContent.match(/(\d+)\s*(min|minute)/i);
                if (match) duracion = `${match[1]} min`;
            }
            
            // DECK - Información del deck
            const deck = deckInfo;
            
            datos.push({
                resultado,
                colores,
                oponente,
                posicion,
                rankInicial,
                rankFinal,
                duracion,
                deck
            });
            
            // Mostrar progreso
            if ((idx + 1) % 25 === 0) {
                console.log(`  Procesadas ${idx + 1}/${partidas.length} partidas...`);
            }
            
        } catch (error) {
            errores++;
        }
    });
    
    console.log(`  ✅ Procesamiento completado: ${datos.length} partidas extraídas`);
    if (errores > 0) {
        console.log(`  ⚠️ Errores durante procesamiento: ${errores}`);
    }
    
    // =========================
    // GENERAR CSV
    // =========================
    console.log('\n📝 GENERANDO ARCHIVO CSV:');
    
    const headers = ['Resultado', 'Colores', 'Oponente', 'Posicion', 'Rank_Inicial', 'Rank_Final', 'Duracion', 'Deck'];
    const csvLines = [headers.join(',')];
    
    datos.forEach(d => {
        const fila = [
            d.resultado,
            `"${d.colores}"`,
            `"${d.oponente}"`,
            `"${d.posicion}"`,
            `"${d.rankInicial}"`,
            `"${d.rankFinal}"`,
            `"${d.duracion}"`,
            `"${d.deck}"`
        ];
        csvLines.push(fila.join(','));
    });
    
    const csv = csvLines.join('\n');
    
    // =========================
    // DESCARGAR ARCHIVO
    // =========================
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileName = `mtg_arena_history_${new Date().toISOString().split('T')[0]}_${Date.now()}.csv`;
    
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // =========================
    // ESTADÍSTICAS FINALES
    // =========================
    console.log('\n' + '='*60);
    console.log('✅ EXTRACCIÓN COMPLETADA');
    console.log('='*60);
    
    const wins = datos.filter(d => d.resultado === 'WIN').length;
    const losses = datos.filter(d => d.resultado === 'LOSS').length;
    const winrate = wins + losses > 0 ? ((wins/(wins+losses))*100).toFixed(1) : '0';
    
    console.log('\n📊 RESUMEN FINAL:\n');
    
    const resumen = {
        'Total partidas extraídas': datos.length,
        'Victorias': wins,
        'Derrotas': losses,
        'Winrate': `${winrate}%`,
        'Partidas Version 1': partidasPorVersion['Version 1'],
        'Partidas Version 2': partidasPorVersion['Version 2'],
        'Sin versión identificada': partidasPorVersion['Sin versión identificada']
    };
    
    console.table(resumen);
    
    // Verificación final
    if (partidasPorVersion['Version 1'] === 0 || partidasPorVersion['Version 2'] === 0) {
        console.log('\n⚠️ IMPORTANTE:');
        console.log('Parece que faltan partidas de alguna versión.');
        console.log('Si esperabas más partidas:');
        console.log('1. Ejecuta el SCRIPT 1 (EXPANSOR) nuevamente');
        console.log('2. Verifica que TODAS las sesiones estén expandidas');
        console.log('3. Vuelve a ejecutar este script');
    }
    
    console.log('\n📁 Archivo descargado: ' + fileName);
    console.log('✅ Caracteres Unicode preservados correctamente');
    
})();
