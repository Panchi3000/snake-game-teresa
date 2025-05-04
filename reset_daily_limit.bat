@echo off
echo ===============================================
echo    Reinicio del Limite Diario - Snake Game
echo ===============================================
echo.
echo Este archivo reiniciara el limite diario del juego Snake
echo para que Teresa Elizabeth pueda jugar nuevamente.
echo.
echo IMPORTANTE: Este archivo es solo para uso del administrador.
echo.
echo Presiona cualquier tecla para continuar...
pause > nul

echo.
echo Reiniciando limite diario...

:: Crear un archivo HTML temporal que ejecute el script de reinicio
echo ^<!DOCTYPE html^> > temp_reset.html
echo ^<html^> >> temp_reset.html
echo ^<head^> >> temp_reset.html
echo     ^<title^>Reinicio de Limite Diario^</title^> >> temp_reset.html
echo     ^<script^> >> temp_reset.html
echo         function resetLimit() { >> temp_reset.html
echo             try { >> temp_reset.html
echo                 // Obtener los datos guardados >> temp_reset.html
echo                 const savedData = localStorage.getItem('snakeGameData'); >> temp_reset.html
echo                 >> temp_reset.html
echo                 if (savedData) { >> temp_reset.html
echo                     // Parsear los datos >> temp_reset.html
echo                     const gameData = JSON.parse(savedData); >> temp_reset.html
echo                     >> temp_reset.html
echo                     // Mantener los premios desbloqueados >> temp_reset.html
echo                     const unlockedRewards = gameData.unlockedRewards || []; >> temp_reset.html
echo                     >> temp_reset.html
echo                     // Crear nuevos datos con el limite reiniciado >> temp_reset.html
echo                     const newGameData = { >> temp_reset.html
echo                         hasPlayedToday: false, >> temp_reset.html
echo                         gameDate: new Date().toLocaleDateString(), >> temp_reset.html
echo                         dailyAttemptsUsed: 0, >> temp_reset.html
echo                         unlockedRewards: unlockedRewards >> temp_reset.html
echo                     }; >> temp_reset.html
echo                     >> temp_reset.html
echo                     // Guardar los nuevos datos >> temp_reset.html
echo                     localStorage.setItem('snakeGameData', JSON.stringify(newGameData)); >> temp_reset.html
echo                     >> temp_reset.html
echo                     document.getElementById('result').innerHTML = 'Limite diario reiniciado con exito. Teresa Elizabeth puede jugar nuevamente.'; >> temp_reset.html
echo                 } else { >> temp_reset.html
echo                     document.getElementById('result').innerHTML = 'No hay datos de juego para reiniciar. Teresa Elizabeth puede jugar normalmente.'; >> temp_reset.html
echo                 } >> temp_reset.html
echo             } catch (e) { >> temp_reset.html
echo                 document.getElementById('result').innerHTML = 'Error al reiniciar el limite diario: ' + e.message; >> temp_reset.html
echo             } >> temp_reset.html
echo         } >> temp_reset.html
echo     ^</script^> >> temp_reset.html
echo ^</head^> >> temp_reset.html
echo ^<body onload="resetLimit()"^> >> temp_reset.html
echo     ^<h1^>Reinicio de Limite Diario^</h1^> >> temp_reset.html
echo     ^<div id="result"^>Procesando...^</div^> >> temp_reset.html
echo     ^<p^>Puedes cerrar esta ventana.^</p^> >> temp_reset.html
echo ^</body^> >> temp_reset.html
echo ^</html^> >> temp_reset.html

:: Abrir el archivo HTML temporal en el navegador predeterminado
start "" temp_reset.html

echo.
echo El proceso ha finalizado.
echo Ahora Teresa Elizabeth puede jugar nuevamente.
echo.
echo Presiona cualquier tecla para salir...
pause > nul

:: Eliminar el archivo temporal después de un breve retraso
timeout /t 3 /nobreak > nul
del temp_reset.html

exit
