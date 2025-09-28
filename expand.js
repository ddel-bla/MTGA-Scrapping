// ==========================================
// SCRIPT 1: EXPANSOR AUTOMÁTICO CORREGIDO
// Expande: Versiones → Play History → TODOS los Show Matches
// NO expande: Matchups
// ==========================================

(async function() {
    'use strict';
    
    console.clear();
    console.log('%c🔧 EXPANSOR AUTOMÁTICO MTG ARENA', 'color: #ff6b6b; font-size: 18px; font-weight: bold;');
    console.log('Expandiendo: Versiones → Play History → TODAS las sesiones');
    console.log('Ignorando: Matchups');
    console.log('='*60);
    
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    
    // =========================
    // PASO 1: EXPANDIR VERSIONES DEL DECK
    // =========================
    console.log('\n📂 PASO 1: Expandiendo versiones del deck...');
    
    let versionChevrons = Array.from(document.querySelectorAll('i.fa-chevron-down, i.fal.fa-chevron-down'))
        .filter(chevron => {
            const text = (chevron.parentElement?.parentElement?.parentElement?.textContent || '');
            return text.includes('Version') && text.includes('Created') && text.includes('ago');
        });
    
    console.log(`  Encontradas ${versionChevrons.length} versiones cerradas`);
    
    for (let i = 0; i < versionChevrons.length; i++) {
        const clickTarget = versionChevrons[i].parentElement || versionChevrons[i];
        clickTarget.click();
        console.log(`  ✅ Versión ${i + 1} expandida`);
        await sleep(500);
    }
    
    // =========================
    // PASO 2: EXPANDIR "PLAY HISTORY" (NO "MATCHUPS")
    // =========================
    await sleep(1000);
    console.log('\n📂 PASO 2: Expandiendo "Play History" (ignorando Matchups)...');
    
    let playHistoryChevrons = Array.from(document.querySelectorAll('i.fa-chevron-down, i.fal.fa-chevron-down'))
        .filter(chevron => {
            const text = (chevron.parentElement?.parentElement?.parentElement?.textContent || '');
            // IMPORTANTE: Solo Play History, NO Matchups
            return text.includes('Play History') && !text.includes('Matchups');
        });
    
    console.log(`  Encontrados ${playHistoryChevrons.length} "Play History" cerrados`);
    
    for (let i = 0; i < playHistoryChevrons.length; i++) {
        const clickTarget = playHistoryChevrons[i].parentElement || playHistoryChevrons[i];
        clickTarget.click();
        console.log(`  ✅ Play History ${i + 1} expandido`);
        await sleep(500);
    }
    
    // =========================
    // PASO 3: EXPANDIR TODOS LOS "SHOW MATCHES"
    // =========================
    await sleep(1500); // Más tiempo para que carguen todas las sesiones
    console.log('\n📂 PASO 3: Expandiendo TODAS las sesiones ("Show Matches")...');
    
    // Método 1: Buscar botones/elementos con texto "Show Matches"
    let showMatchesElements = [];
    
    // Buscar todos los elementos que contengan "Show Matches"
    const allElements = document.querySelectorAll('*');
    allElements.forEach(elem => {
        if (elem.textContent === 'Show Matches' && 
            !elem.querySelector('*') && // Es un nodo hoja
            elem.parentElement) {
            showMatchesElements.push(elem.parentElement);
        }
    });
    
    // Si no encuentra por texto exacto, buscar por chevrons asociados
    if (showMatchesElements.length === 0) {
        console.log('  Buscando chevrons asociados a sesiones...');
        
        showMatchesElements = Array.from(document.querySelectorAll('i.fa-chevron-down, i.fal.fa-chevron-down'))
            .filter(chevron => {
                const parent = chevron.parentElement?.parentElement;
                const text = parent?.textContent || '';
                // Buscar patrones de sesiones (tienen duración, winrate, matches)
                return (text.includes('Show Matches') || 
                       (text.includes('minute') && text.includes('WINRATE') && text.includes('MATCHES')));
            })
            .map(chevron => {
                // Intentar encontrar el elemento clickeable correcto
                const possibleTargets = [
                    chevron.parentElement,
                    chevron.parentElement?.querySelector('button'),
                    chevron.parentElement?.parentElement?.querySelector('button'),
                    chevron.parentElement?.parentElement
                ].filter(Boolean);
                
                // Buscar específicamente el elemento con "Show Matches"
                for (const target of possibleTargets) {
                    if (target.textContent?.includes('Show Matches')) {
                        return target;
                    }
                }
                
                return chevron.parentElement || chevron;
            });
    }
    
    // Eliminar duplicados
    showMatchesElements = [...new Set(showMatchesElements)];
    
    console.log(`  Encontrados ${showMatchesElements.length} "Show Matches" para expandir`);
    
    if (showMatchesElements.length === 0) {
        console.log('  ⚠️ No se encontraron elementos "Show Matches"');
        console.log('  Esto puede significar que ya están todos expandidos');
    } else {
        let expandedCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < showMatchesElements.length; i++) {
            try {
                const element = showMatchesElements[i];
                
                // Buscar el elemento clickeable más apropiado
                let clickTarget = element;
                
                // Si es un texto, buscar el botón padre
                if (element.tagName !== 'BUTTON') {
                    const button = element.querySelector('button') || 
                                 element.closest('button') ||
                                 element;
                    clickTarget = button;
                }
                
                // Hacer click
                clickTarget.click();
                expandedCount++;
                
                // Log de progreso
                if ((i + 1) % 5 === 0 || i === showMatchesElements.length - 1) {
                    console.log(`  ... ${expandedCount}/${showMatchesElements.length} sesiones expandidas`);
                }
                
                // Delay entre clicks para no sobrecargar
                await sleep(300);
                
            } catch (e) {
                errorCount++;
                console.error(`  Error expandiendo sesión ${i + 1}:`, e.message);
            }
        }
        
        console.log(`  ✅ Expansión completada: ${expandedCount} exitosas, ${errorCount} errores`);
    }
    
    // =========================
    // VERIFICACIÓN FINAL
    // =========================
    await sleep(2000);
    console.log('\n🔍 Verificando estado final...');
    
    // Contar elementos
    const allChevrons = document.querySelectorAll('i.fa-chevron-down, i.fal.fa-chevron-down, i.fa-chevron-up, i.fal.fa-chevron-up');
    const closedChevrons = Array.from(allChevrons).filter(c => c.classList.contains('fa-chevron-down'));
    const openChevrons = Array.from(allChevrons).filter(c => c.classList.contains('fa-chevron-up'));
    
    // Contar específicamente Show Matches restantes
    let remainingShowMatches = 0;
    document.querySelectorAll('*').forEach(elem => {
        if (elem.textContent === 'Show Matches' && !elem.querySelector('*')) {
            remainingShowMatches++;
        }
    });
    
    // Contar Hide Matches (sesiones ya expandidas)
    let hideMatchesCount = 0;
    document.querySelectorAll('*').forEach(elem => {
        if (elem.textContent === 'Hide Matches' && !elem.querySelector('*')) {
            hideMatchesCount++;
        }
    });
    
    console.log('\n📊 RESUMEN FINAL:');
    console.log(`  📂 Elementos abiertos: ${openChevrons.length}`);
    console.log(`  📁 Elementos cerrados: ${closedChevrons.length}`);
    console.log(`  ✅ Sesiones expandidas (Hide Matches): ${hideMatchesCount}`);
    console.log(`  ⏳ Show Matches restantes: ${remainingShowMatches}`);
    
    // Verificar si quedan elementos importantes sin expandir
    const importantClosed = closedChevrons.filter(chevron => {
        const text = (chevron.parentElement?.parentElement?.parentElement?.textContent || '');
        return text.includes('Play History') || text.includes('Show Matches');
    });
    
    if (importantClosed.length > 0) {
        console.log(`\n⚠️ ATENCIÓN: Aún quedan ${importantClosed.length} elementos importantes sin expandir`);
        console.log('Puedes ejecutar el script nuevamente para intentar expandirlos');
    } else if (remainingShowMatches > 0) {
        console.log(`\n⚠️ ATENCIÓN: Aún quedan ${remainingShowMatches} "Show Matches" sin expandir`);
        console.log('Ejecuta el script nuevamente si es necesario');
    } else {
        console.log('\n✅ EXPANSIÓN COMPLETADA EXITOSAMENTE');
        console.log('Todas las secciones necesarias están expandidas');
    }
    
    // =========================
    // CONTAR PARTIDAS VISIBLES
    // =========================
    const partidasVisibles = document.querySelectorAll("li.sc-16524a9a-0").length;
    const partidasConResultado = Array.from(document.querySelectorAll("li.sc-16524a9a-0"))
        .filter(li => li.querySelector(".result-info")).length;
    
    console.log('\n📊 PARTIDAS DETECTADAS:');
    console.log(`  Total elementos: ${partidasVisibles}`);
    console.log(`  Con información de resultado: ${partidasConResultado}`);
    
    // =========================
    // INSTRUCCIONES FINALES
    // =========================
    console.log('\n' + '='*60);
    console.log('📋 SIGUIENTE PASO:');
    console.log('Ejecuta el SCRIPT 2 (EXTRACTOR) para generar el CSV');
    console.log(`Deberías obtener aproximadamente ${partidasConResultado} partidas`);
    console.log('='*60);
    
})();
