В режиме отслеживания (команда gulp) происходит только подключение компонентов из разных файлов(для html, scss, js), конвертация scss в css и перезагрузка браузера. В общем ничего лишнего и замедляющего процесс работы нет. В сборке так же подключена библиотека jQuery через npm.

При сборке проекта (команда gulp build) происходит сжатие изображений и конвертация jpg и png в webp, подключение в html и css дополнительных тегов и селекторов для webp, минификация всех типов данных, media запросы в css группируются в конце файла style, в css добавляются префиксы.

Для подключения шрифтов использовать команду gulp fonts, которая конвертирует шрифты из формата otf в ttf, а из ttf в woff и в woff2, подключая их в fonts.scss в форматах ttf, woff, woff2. При сборке проекта в папку dist/fonts (по умолчанию) копируются только шрифты формата ttf, woff и woff2.

Можно создать из всех изображений формата svg один спрайт командой gulp svg. Спрайт создается в папке с остальными изображениями.

Изменить название рабочей папки и папки для дистрибутива можно в gulpfile.js, поменяв значения переменных let source_folder = '#app'и let dist_folder = 'dist' в начале файла.
