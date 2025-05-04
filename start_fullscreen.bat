@echo off
echo Iniciando Snake Game en modo pantalla completa...
echo.

:: Crear un archivo HTML temporal que abre el juego en pantalla completa
echo ^<!DOCTYPE html^> > fullscreen_launcher.html
echo ^<html^> >> fullscreen_launcher.html
echo ^<head^> >> fullscreen_launcher.html
echo     ^<title^>Snake Game - Pantalla Completa^</title^> >> fullscreen_launcher.html
echo     ^<style^> >> fullscreen_launcher.html
echo         body, html { >> fullscreen_launcher.html
echo             margin: 0; >> fullscreen_launcher.html
echo             padding: 0; >> fullscreen_launcher.html
echo             height: 100%%; >> fullscreen_launcher.html
echo             overflow: hidden; >> fullscreen_launcher.html
echo         } >> fullscreen_launcher.html
echo         iframe { >> fullscreen_launcher.html
echo             width: 100%%; >> fullscreen_launcher.html
echo             height: 100%%; >> fullscreen_launcher.html
echo             border: none; >> fullscreen_launcher.html
echo         } >> fullscreen_launcher.html
echo     ^</style^> >> fullscreen_launcher.html
echo     ^<script^> >> fullscreen_launcher.html
echo         // Función para entrar en modo pantalla completa al cargar >> fullscreen_launcher.html
echo         window.onload = function() { >> fullscreen_launcher.html
echo             // Obtener el elemento que queremos mostrar en pantalla completa >> fullscreen_launcher.html
echo             var elem = document.documentElement; >> fullscreen_launcher.html
echo. >> fullscreen_launcher.html
echo             // Solicitar pantalla completa con diferentes métodos según el navegador >> fullscreen_launcher.html
echo             if (elem.requestFullscreen) { >> fullscreen_launcher.html
echo                 elem.requestFullscreen(); >> fullscreen_launcher.html
echo             } else if (elem.webkitRequestFullscreen) { /* Safari */ >> fullscreen_launcher.html
echo                 elem.webkitRequestFullscreen(); >> fullscreen_launcher.html
echo             } else if (elem.msRequestFullscreen) { /* IE11 */ >> fullscreen_launcher.html
echo                 elem.msRequestFullscreen(); >> fullscreen_launcher.html
echo             } >> fullscreen_launcher.html
echo         }; >> fullscreen_launcher.html
echo     ^</script^> >> fullscreen_launcher.html
echo ^</head^> >> fullscreen_launcher.html
echo ^<body^> >> fullscreen_launcher.html
echo     ^<iframe src="index.html" allowfullscreen="true"^>^</iframe^> >> fullscreen_launcher.html
echo ^</body^> >> fullscreen_launcher.html
echo ^</html^> >> fullscreen_launcher.html

:: Abrir el archivo HTML temporal en el navegador predeterminado
start fullscreen_launcher.html

echo El juego se ha iniciado en modo pantalla completa.
echo Puedes cerrar esta ventana.
echo.
pause

exit
