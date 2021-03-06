/*
 *  aMovies  - Movian Plugin
 *
 *  Copyright (C) 2014-2015 Buksa
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
//ver 0.5.3
(function(plugin) {
    var plugin_info = plugin.getDescriptor();
    var PREFIX = plugin_info.id;
    // bazovyj adress saita
    var BASE_URL = 'http://amovies.tv';
    var USER_AGENT = 'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:16.0) Gecko/20120815 Firefox/16.0';
    //logo
    var logo = plugin.path + 'logo.png';
    //tos
    var tos = 'The developer has no affiliation with the sites what so ever.\n';
    tos += 'Nor does he receive money or any other kind of benefits for them.\n\n';
    tos += 'The software is intended solely for educational and testing purposes,\n';
    tos += 'and while it may allow the user to create copies of legitimately acquired\n';
    tos += 'and/or owned content, it is required that such user actions must comply\n';
    tos += 'with local, federal and country legislation.\n\n';
    tos += 'Furthermore, the author of this software, its partners and associates\n';
    tos += 'shall assume NO responsibility, legal or otherwise implied, for any misuse\n';
    tos += 'of, or for any loss that may occur while using plugin.\n\n';
    tos += 'You are solely responsible for complying with the applicable laws in your\n';
    tos += 'country and you must cease using this software should your actions during\n';
    tos += 'plugin operation lead to or may lead to infringement or violation of the\n';
    tos += 'rights of the respective content copyright holders.\n\n';
    tos += "plugin is not licensed, approved or endorsed by any online resource\n ";
    tos += "proprietary. Do you accept this terms?";
    // Register a service (will appear on home page)
    var service = plugin.createService(plugin_info.title, PREFIX + ":start", "video", true, logo);
    //settings
    var settings = plugin.createSettings(plugin_info.title, logo, plugin_info.synopsis);
    settings.createInfo("info", logo, "Plugin developed by " + plugin_info.author + ". \n");
    settings.createDivider('Settings:');
    settings.createBool("tosaccepted", "Accepted TOS (available in opening the plugin):", false, function(v) {
        service.tosaccepted = v;
    });
    settings.createBool("debug", "Debug", false, function(v) {
        service.debug = v;
    });
    settings.createBool("thetvdb", "Show more information using thetvdb", false, function(v) {
        service.thetvdb = v;
    });
    settings.createInt("Min.Delay", "Интервал запросов к серверу (default: 3 сек)", 3, 1, 10, 1, 'сек', function(v) {
        service.requestMinDelay = v;
    });

    //First level start page
    plugin.addURI(PREFIX + ":start", function(page) {
        page.metadata.logo = plugin.path + "logo.png";
        page.metadata.title = PREFIX;
        if (!service.tosaccepted) if (showtime.message(tos, true, true)) service.tosaccepted = 1;
            else {
                page.error("TOS not accepted. plugin disabled");
                return;
            }
        var v = showtime.httpReq(BASE_URL).toString();
        var re = /h2 class="title_d_dot"[\S\s]+?<span>([^<]+)[\S\s]+?href="([^"]+)[\S\s]+?<ul class=([\S\s]+?)<\/ul/g;
        var re2 = /date">(.+?)<[\S\s]+?src="(.+?)"[\S\s]+?href="http:\/\/amovies.tv(.+?)">(.+?)<[\S\s]+?<span>(.*)/g;
        var m = re.execAll(v);
        var data = [];
        for (var i = 0; i < /*m.length*/ 3; i++) {
            page.appendItem("", "separator", {
                title: new showtime.RichText(m[i][1])
            });
            data.push({
                title: m[i][1],
                href: m[i][2]
            });
            var m2 = re2.execAll(m[i][3].trim());
            for (var j = 0; j < m2.length; j++) {
                page.appendItem(PREFIX + ":page:" + m2[j][3], "video", {
                    title: new showtime.RichText(m2[j][4] + (m2[j][5].length !== 0 ? ' | ' + m2[j][5] : '')),
                    description: new showtime.RichText(m2[j][5] + '\n' + "Updated: " + m2[j][1]),
                    icon: m2[j][2]
                });
                data.push({
                    title: (m2[j][4]),
                    description: (m2[j][5] + '\n' + "Updated: " + m2[j][1]),
                    icon: m2[j][2]
                });
            }
            page.appendItem(PREFIX + ":index:" + m[i][2], "directory", {
                title: ('Дальше больше') + ' ►',
                icon: logo
            });
            //page.appendItem(PREFIX + ":browse:" + m[i][2], "directory", {
            //    title: ('Дальше большеbrowse') + ' ►',
            //    icon: logo
            //});
        }
        //Мультфильмы
        page.appendItem("", "separator", {
            title: new showtime.RichText('Мультфильмы')
        });
        v = showtime.httpReq(BASE_URL + '/cartoons/').toString();
        re = /<div class="date">(.+?)<[\S\s]+?img src="([^"]+)[\S\s]+?<a href="http:\/\/amovies.tv([^"]+)">([^<]+)[\S\s]+?<span>(.+?)<\/span>/g;
        m = re.execAll(v);
        for (i = 0; i < 6; i++) {
            // p(m[i][1]+'\n'+m[i][2]+'\n'+m[i][3]+'\n')
            page.appendItem(PREFIX + ":page:" + m[i][3], "video", {
                //title: new showtime.RichText(m[i][4] + ' | ' + m[i][5].replace('<br />', ' | ')),
                title: new showtime.RichText(m[i][4] + (m[i][5].length !== 0 ? ' | ' + m[i][5] : '')),
                description: new showtime.RichText(m[i][5] + '\n' + "Updated: " + m[i][1]),
                icon: m[i][2]
            });
        }
        page.appendItem(PREFIX + ":index:" + '/cartoons/', "directory", {
            title: ('Дальше больше') + ' ►',
            icon: logo
        });
        //Мультфильмы
        //Серии ENG
        page.appendItem("", "separator", {
            title: new showtime.RichText('Серии ENG')
        });
        v = showtime.httpReq(BASE_URL + '/eng/').toString();
        re = /<div class="date">(.+?)<[\S\s]+?img src="([^"]+)[\S\s]+?<a href="http:\/\/amovies.tv([^"]+)">([^<]+)[\S\s]+?<span>(.+?)<\/span>/g;
        m = re.execAll(v);
        for (i = 0; i < 6; i++) {
            page.appendItem(PREFIX + ":page:" + m[i][3], "video", {
                title: new showtime.RichText(m[i][4]),
                description: new showtime.RichText(m[i][5] + '\n' + "Updated: " + m[i][1]),
                icon: m[i][2]
            });
        }
        page.appendItem(PREFIX + ":index:" + '/eng/', "directory", {
            title: ('Дальше больше') + ' ►',
            icon: logo
        });
        //Серии ENG
        p(data)
        page.type = "directory";
        page.contents = "items";
        page.loading = false;
    });
    //Second level
    plugin.addURI(PREFIX + ":browse:(.*)", browseListPage);

    function browseListPage(page, type) {

        var re, v, m;
        page.contents = "items";
        page.type = "directory";
        page.metadata.logo = plugin.path + "logo.png";
        v = showtime.httpReq(BASE_URL + type).toString();
        page.metadata.title = new showtime.RichText(PREFIX + ' | ' + (/<title>(.*?)<\/title>/.exec(v)[1]));
        re = /<title>(.*?)<\/title>/;
        m = re.exec(v);
        page.appendItem(PREFIX + ':start', 'directory', {
            title: new showtime.RichText('сортировка по : ' + m[1])
        });

        p('vyzov function browseListPage' + 'page' + 'type=' + type)
        page.contents = "items";
        page.type = "directory";
        page.metadata.logo = plugin.path + "logo.png";

        page.appendItem(PREFIX + ':start', 'directory', {
            title: new showtime.RichText('сортировка по : ' + type)
        });

        var respond = '';
        var url = '';
        p(BASE_URL + type);
        var pageNumber = 1;
        var list;
        var requestFinished = true,
            lastRequest = 0;



        function loader() {
            if (!requestFinished) {
                debug("Request not finished yet, exiting");
                return false;
            }

            var delay = countDelay(service.requestMinDelay * 1000, lastRequest);
            var loadItems = function() {
                try {
                    lastRequest = Date.now();
                    requestFinished = false;
                    p("Time to make some requests now!");
                    //make request here

                    p("L:" + BASE_URL + type + "page/" + pageNumber);
                    list = listScraper(BASE_URL + type + 'page/' + pageNumber + '/', false);
                    pageNumber++;

                    requestFinished = true;
                    p("Request finished!");
                    return list;
                } catch (err) {
                    //end of pages
                    if (err.message == 'HTTP error: 404') {
                        showtime.notify("Достигнут конец директории.", 5);
                        return false;
                    }
                    //most probably server overload
                    else {
                        showtime.notify("Подгрузка не удалась. Возможно, сервер перегружен.", 5);
                        //trying to reload the page
                        pageNumber--;
                        return true;
                    }
                }
            };
            showtime.print("Let's wait " + delay + " msec before making a request!");
            showtime.sleep(delay);
            var list = loadItems();

            for (var i = 0; i < list.length; i++) {
                page.appendItem(PREFIX + ':page:' + escape(list[i].url), 'video', {
                    title: new showtime.RichText(list[i].title),
                    description: new showtime.RichText(list[i].description),
                    icon: new showtime.RichText(list[i].image)
                });
            }

            return true;
        }

        loader();
        page.paginator = loader;

        page.loading = false;

        //code
    }

    function listScraper(url, respond) {
        p('function listScraper (url=' + url + ',respond=' + respond + ')')
        if (!respond) {
            respond = showtime.httpReq(url, {
                debug: service.debug,
                method: 'GET',
                headers: {
                    'User-Agent': USER_AGENT
                }
            }).toString();
        }


        var re = /<div class="date">(.+?)<[\S\s]+?img src="([^"]+)[\S\s]+?<a href="http:\/\/amovies.tv([^"]+)">([^<]+)[\S\s]+?<span>(.+?)<\/span>/g;

        var items = new Array(),
            i = 0;

        var item = re.exec(respond);

        while (item) {
            p("Found title:" + item[2]);
            items.push({
                url: item[3],
                title: (item[4] + ' | ' + item[5].replace('<br />', ' | ')),
                image: item[2],
                description: (item[5] + '\n' + "Updated: " + item[1])
            });
            item = re.exec(respond);
        }

        //	re = /<div class="img">[\S\s]{0,300}<img src="(\S*)"/g;
        //	item = re.exec(respond);
        //	while(item) {
        //	  p(item[1]);
        //	  items[i].image = item[1];
        //	  i++;
        //
        //	  item = re.exec(respond);
        //	}

        p('Returning list with ' + items.length + ' items');
        return items;
    };

    plugin.addURI(PREFIX + ":index:(.*)", function(page, link) {
        var re, v, m;
        page.contents = "items";
        page.type = "directory";
        page.metadata.logo = plugin.path + "logo.png";
        v = showtime.httpReq(BASE_URL + link).toString();
        page.metadata.title = new showtime.RichText(PREFIX + ' | ' + (/<title>(.*?)<\/title>/.exec(v)[1]));
        re = /<title>(.*?)<\/title>/;
        m = re.exec(v);
        page.appendItem(PREFIX + ':start', 'directory', {
            title: new showtime.RichText('сортировка по : ' + m[1])
        });
        var offset = 1;
        //var total_page = parseInt(/<div class="navigation[\S\s]+?nav_ext[\S\s]+?">([^<]+)/.exec(v)[1], 10);

        function loader() {
            //http://amovies.tv/serials/page/2/
            var v = showtime.httpReq(BASE_URL + link + 'page/' + offset + '/').toString();
            var has_nextpage = false;
            var match = v.match(/<ul class="ul_clear navigation">[\S\s]+?"http:\/\/amovies.tv(.+?)"><li>Вперед<\/li><\/a>/);
            if (match) has_nextpage = true
            re = /<div class="date">(.+?)<[\S\s]+?img src="([^"]+)[\S\s]+?<a href="http:\/\/amovies.tv([^"]+)">([^<]+)[\S\s]+?<span>(.+?)<\/span>/g;
            m = re.execAll(v);
            for (var i = 0; i < m.length; i++) {
                // p(m[i][1]+'\n'+m[i][2]+'\n'+m[i][3]+'\n')
                page.appendItem(PREFIX + ":page:" + m[i][3], "video", {
                    title: new showtime.RichText(m[i][4] + ' | ' + m[i][5].replace('<br />', ' | ')),
                    description: new showtime.RichText(m[i][5] + '\n' + "Updated: " + m[i][1]),
                    icon: m[i][2]
                });
            }
            //if (nnext) {
            //page.appendItem(PREFIX + ':index:' + nnext, 'directory', {
            //    title: new showtime.RichText('Вперед')
            //});
            //}
            //var nnext = match(/<ul class="ul_clear navigation">[\S\s]+?"http:\/\/amovies.tv(.+?)"><li>Вперед<\/li><\/a>/, v, 1);
            ////p('nnext='+nnext+' !nnext='+!nnext+' !!nnext='+!!nnext)
            offset++;
            return has_nextpage;
            // return offset < parseInt(/<div class="navigation[\S\s]+?nav_ext[\S\s]+?">([^<]+)/.exec(v)[1], 10)
        }
        loader();
        page.loading = false;
        page.paginator = loader;
    });
    plugin.addURI(PREFIX + ":page:(.*)", function(page, link) {
        var i, v, item, re, re2, m, m2, data = {};
        p('Open page: ' + BASE_URL + link);
        v = showtime.httpReq(BASE_URL + link).toString();
        p(v)

        data.Referer = BASE_URL + link
        post_full = v.match(/<article class="post_full">([\s\S]+)<div class="vk_comments">/);
        if (post_full != null) {
            post_full = post_full[1]
            p(post_full)
        } else {
            p(' Match attempt failed')
        }




        try {
            var md = {};
            md.title = /title_d_dot"><span> ([^<]+)/.exec(post_full)[1]
            md.icon = /<img src="([^"]+)/g.exec(post_full)[1]
            md.icon = md.icon.indexOf('http') !== -1 ? md.icon : BASE_URL + md.icon

            data.title = md.title;
            var ar_add_series = v.match(/class="title_d_dot">.*Архив добавления серий[\S\s]+?<\/div/);
            if (ar_add_series) {
                re = /: (.*?) \| ([0-9]+(?:\.[0-9]*)?) сезон/;
                md.season = parseInt(match(/(\d+) сезон/, ar_add_series, 1), 10);
                data.season = md.season;
                md.eng_title = match(/\|(.+?)\|/, ar_add_series, 1).trim();
                data.eng_title = match(/\|(.+?)\|/, ar_add_series, 1).trim()
            }
            md.year = +/Год[\S\s]+?(\d+)/.exec(post_full)[1]
            data.year = +md.year;
            md.status = match(/<li><strong>Статус:<\/strong><span>([^<]+)/, post_full, 1);
            md.genre = match(/<li><strong>Жанр:<\/strong><span>([^<]+)/, post_full, 1);
            md.duration = +match(/<li><strong>Время[\S\s]+?(\d+)/, post_full, 1);
            md.country = match(/<li><strong>Страна:<\/strong><span>(.+?)</, post_full, 1);
            md.rating = +match(/<li><strong>Рейтинг[\S\s]+?([0-9]+(?:\.[0-9]*)?)<\/strong>/, post_full, 1);
            md.director = match(/<li><strong>Режиссер:<\/strong><span>(.+?)<\/span>/, post_full, 1);
            md.actor = match(/<li><strong>Актеры:<\/strong><span>(.+?)<\/span><\/li>/, post_full, 1);
            md.description = match(/<div class="post_text">([\S\s]+?)<\/div>/, post_full, 1);
            page.metadata.title = md.title;
            //Трейлер:
            //page.appendItem("", "separator", {
            //    title: new showtime.RichText('Трейлер:')
            //});

            page.appendItem("youtube:feed:" + escape("https://gdata.youtube.com/feeds/api/videos?q=" + encodeURIComponent('Русский Трейлер ' + md.title)), "directory", {
                title: 'найти трейлер на YouTube'
            });
            if (link.indexOf('katalog-serialov') !== -1) {
                //trailer
                var json = showtime.httpReq('https://gdata.youtube.com/feeds/api/videos?q=' + encodeURIComponent('Русский трейлер сериал ' + md.title + 'сезон 1') + '&max-results=1&v=2&alt=jsonc&orderby=published').toString();
                if (json.indexOf('"id"') !== -1) {
                    json = JSON.parse(json);
                    //             https://gdata.youtube.com/feeds/api/videos?q=Трейлер&max-results=1&v=2&alt=jsonc&orderby=published
                    page.appendItem('youtube:video:simple:' + escape(page.metadata.title + " - " + 'Трейлер') + ":" + json.data.items[0].id, "video", {
                        title: 'Трейлер: ' + md.title,
                        icon: json.data.items[0].thumbnail.hqDefault
                    });
                }
                p('katalog-serialov' + '\n' + link);
                re = /<strong>(\w сезон) <\/strong>(.*)/g;
                re2 = /href="http:\/\/amovies.tv(.+?)" >(.+?)<\/a>/g;
                m = re.execAll(v);
                for (i = 0; i < m.length; i++) {
                    page.appendItem("", "separator", {
                        title: new showtime.RichText(m[i][1])
                    });
                    m2 = re2.execAll(m[i][2].trim());
                    for (var j = 0; j < m2.length; j++) {
                        page.appendItem(PREFIX + ":page:" + m2[j][1], "video", {
                            title: new showtime.RichText(md.title + ' | ' + m2[j][2]),
                            year: md.year,
                            icon: md.icon,
                            genre: md.genre,
                            duration: +md.duration,
                            rating: +md.rating * 10,
                            description: new showtime.RichText((md.status ? 'Статус: ' + md.status + '\n' : '') + (md.director ? 'Режиссер: ' + md.director + '\n' : '') + (md.actor ? 'Актеры: ' + md.actor + '\n' : '') + '\n' + md.description)
                        });
                    }
                }
            }
            if (link.indexOf('serials') != -1 || link.indexOf('cartoons') != -1) {
                // var JSON = JSON.parse(showtime.httpReq('http://query.yahooapis.com/v1/public/yql?q=use%20%22store%3A%2F%2FcruFRRY1BVjVHmIw4EPyYu%22%20as%20Untitled%3B%20SELECT%20Series.seriesid%20FROM%20Untitled%20WHERE%20seriesname%3D%22'+encodeURIComponent(s[0].trim())+'%22%20and%20language%3D%22ru%22%20|%20truncate%28count%3D1%29&format=json'))
                p('serials' + '\n' + link);
                //re = /value=(?:"http:\/\/vk.com\/|"http:\/\/rutube.ru\/|"http:\/\/videoapi.my.mail.ru\/)([^"]+)[\S\s]+?>([^<]+)/g;
                re = /value=(?:".*?)(oid=.+?&id=.+?&hash=[^&]+|videoapi.my.mail.ru\/[^"]+)[\S\s]+?>([^<]+)/g;
                m = re.execAll(v);
                if (m.toString()) {
                    for (i = 0; i < m.length; i++) {
                        data.url = m[i][1];
                        data.episode = +match(/([0-9]+(?:\.[0-9]*)?)/, m[i][2], 1);
                        data.title = md.eng_title
                        item = page.appendItem(PREFIX + ":play:" + escape(JSON.stringify(data)), "video", {
                            title: md.eng_title + ' | ' + md.season + ' сезон | ' + m[i][2],
                            season: +md.season,
                            imdbid: md.imdbid,
                            year: md.year,
                            icon: md.icon,
                            genre: md.genre,
                            duration: +md.duration,
                            rating: +md.rating * 10,
                            description: new showtime.RichText((md.status ? 'Статус: ' + md.status + '\n' : '') + (md.director ? 'Режиссер: ' + md.director + '\n' : '') + (md.actor ? 'Актеры: ' + md.actor + '\n' : '') + '\n' + md.description)
                        });
                        if (service.thetvdb) {
                            item.bindVideoMetadata({
                                title: md.title.split('езон')[0].trim(),
                                season: +md.season,
                                episode: data.episode
                            });
                        }
                    }
                }
                //Перейти к каталогу сериала
                re = /<div class="link_catalog">.+?"http:\/\/amovies.tv(.+?)">(.+?)</;
                m = re.exec(v);
                if (m) {
                    page.appendItem(PREFIX + ":page:" + m[1], "directory", {
                        title: m[2]
                    });
                }
                //page.appendItem("", "separator", {
                //    title: new showtime.RichText('Перейти к каталогу сериала')
                //});
            }
            if (link.indexOf('/film/') != -1) {
                data.eng_title = md.title.split(' | ')[1];
                p('film' + '\n' + link);
                p(md.title);
                data.url = match(/<iframe src="http:\/\/vk.com\/([^"]+)/, post_full, 1)
                data.url = match(/(http:\/\/hdgo.cc[^"]+)/, post_full, 1)
                item = page.appendItem(PREFIX + ":play:" + escape(JSON.stringify(data)), "video", {
                    title: md.title,
                    season: +md.season,
                    year: md.year,
                    imdbid: md.imdbid,
                    icon: md.icon,
                    genre: md.genre,
                    duration: +md.duration,
                    rating: +md.rating * 10,
                    description: new showtime.RichText((md.status ? 'Статус: ' + md.status + '\n' : '') + (md.director ? 'Режиссер: ' + md.director + '\n' : '') + (md.actor ? 'Актеры: ' + md.actor + '\n' : '') + '\n' + md.description)
                });
                if (service.thetvdb) {
                    item.bindVideoMetadata({
                        title: md.title.split(' | ')[1],
                        year: md.year
                    });
                }
            }
            //http://amovies.tv/eng
            if (link.indexOf('/eng/') != -1) {
                p('eng' + '\n' + link);
                re = /value=(?:"http:\/\/vk.com\/|"http:\/\/rutube.ru\/)([^"]+)">(\W+)([0-9]+(?:\.[0-9]*)?) сезон ([0-9]+(?:\.[0-9]*)?) серия/g;
                m = re.execAll(v);
                if (m.toString()) {
                    for (i = 0; i < m.length; i++) {
                        data.title = m[i][2].trim();
                        data.season = +m[i][3];
                        data.episode = +m[i][4];
                        data.url = m[i][1];
                        item = page.appendItem(PREFIX + ":play:" + escape(JSON.stringify(data)), "video", {
                            title: data.title + ' | ' + data.season + ' сезон ' + data.episode + ' серия'
                        });
                        if (service.thetvdb) {
                            item.bindVideoMetadata({
                                title: data.title,
                                season: data.season,
                                episode: data.episode
                            });
                        }
                    }
                }
            }
            p(md);
            p(data);
        } catch (ex) {
            page.error("Failed to process page");
            e(ex);
        }


        page.metadata.logo = plugin.path + "logo.png";
        page.type = "directory";
        page.contents = "contents";
        page.loading = false;
    });
    // Play links
    plugin.addURI(PREFIX + ":play:(.*)", function(page, data) {
        page.loading = true;
        var canonicalUrl = PREFIX + ":play:" + (data);
        data = JSON.parse(unescape(data));
        if (data.season || data.episode) {
            page.metadata.title = data.title + " | " + data.season + " \u0441\u0435\u0437\u043e\u043d " + " | " + data.episode + " \u0441\u0435\u0440\u0438\u044f"
        } else page.metadata.title = data.title

        var videoparams = {
            canonicalUrl: canonicalUrl,
            no_fs_scan: true,
            title: data.eng_title,
            year: data.year ? data.year : 0,
            season: data.season ? data.season : -1,
            episode: data.episode ? data.episode : -1,
            sources: [{
                    url: []
                }
            ],
            subtitles: []
        };


        p(data);
        if (data.url.indexOf('ideoapi.my.mail.ru') !== -1) {
            v = showtime.httpGet('http://' + data.url);
            // var video_key = getCookie('video_key',v.multiheaders)
            //https://api.vk.com/method/video.getEmbed?oid=-86688251&video_id=170996975&embed_hash=1c63dad9f125d575&hd=2
            var json = JSON.parse(showtime.httpGet(/metadataUrl":"([^"]+)/.exec(v)[1]));
            for (i in json.videos) {
                videoparams.sources = [{
                        url: json.videos[i].url,
                        mimetype: 'video/quicktime'
                    }
                ]
                data.video_url = json.videos[i].url
                videoparams.title = json.meta.title
                video = "videoparams:" + JSON.stringify(videoparams);
                page.appendItem(video, "video", {
                    title: '[' + json.videos[i].key + ']-' + json.meta.title,
                    duration: json.meta.duration,
                    icon: json.meta.poster
                })


            }
            //page.appendItem("search:" + data.title, "directory", {
            //    title: 'найти ' + data.title
            //});
            //page.type = "directory";
            //page.loading = false;
        }

        if (data.url.indexOf('oid=') !== -1) {

            vars = JSON.parse(showtime.httpReq('https://api.vk.com/method/video.getEmbed?' + data.url.replace('&id', '&video_id').replace('&hash', '&embed_hash')).toString());
            p(vars)
            if (vars.error) {
                page.metadata.title = vars.error.error_msg
                showtime.notify(vars.error.error_msg + '\n' + 'This video has been removed from public access.', 3)

            } else {
                for (key in vars.response) {
                    if (key == 'cache240' || key == 'cache360' || key == 'cache480' || key == 'cache720' || key == 'url240' || key == 'url360' || key == 'url480' || key == 'url720') {
                        videoparams.sources = [{
                                url: vars.response[key],
                                mimetype: "video/quicktime"
                            }
                        ]
                        video = "videoparams:" + JSON.stringify(videoparams)
                        page.appendItem(video, "video", {
                            title: "[" + key.match(/\d+/g) + "]-" + data.title + " | " + data.season + " \u0441\u0435\u0437\u043e\u043d  | " + data.episode + " \u0441\u0435\u0440\u0438\u044f",
                            duration: vars.response.duration,
                            icon: vars.response.thumb
                        });
                    }
                }
            }


            //page.appendItem("search:" + data.title, "directory", {
            //    title: 'найти ' + data.title
            //});
            //page.type = "directory";
            //page.loading = false;
        }

        if (data.url.indexOf('hdgo.cc') !== -1) {
            p(data.url)
            var v = showtime.httpReq(data.url, {
                method: 'GET',
                headers: {
                    Referer: data.Referer

                }
            }).toString();
            p(v)
            video_url = /source src="(http.+\/)(.+?)\.mp4/.exec(v)
//            function setHTML5 () {
//$('#player-hd').html('<video controls autoplay width=100% height=100%><source src="http://server11.hdgo.cc/flv/9f382d73f27aacb231c5cb26b42ec05d/5ca24e0be2622243b6dcf25f95da0239.mp4" type="video/mp4; codecs="avc1.4D401E, mp4a.40.2""></video>');
//	}
//	
//function setPlayer () {
//    if (is_html5()) {
//        setHTML5();
//    } else {
//        setFlash('vCV82iob3gRLvcy43Ik43jEcv5hZkasBUatLk5Wav145t1DNkg31kjncUxFjUjn1txtzUanNy5nbt5wjtgwZv1wjUQnbkQuHkQnatjnNygyHy5ojkjnzkjZzkdEVtjtmv5k8GDrr');
////    }
////}
//
//            http: //server17.hdgo.cc/flv/9f382d73f27aacb231c5cb26b42ec05d/480-4fb3f9e2929074d52d35150af30a7f24.flv
            videoparams.sources = [{
                    url: video_url[1] + video_url[2] + '.mp4',
                    mimetype: "video/mp4"
                }
            ]
            video = "videoparams:" + JSON.stringify(videoparams)
            page.appendItem(video, "video", {
                title: "[MP4]-" + data.title
            });

            videoparams.sources = [{
                    url: video_url[1] + '720-' + video_url[2] + '.flv'
                }
            ]
            video = "videoparams:" + JSON.stringify(videoparams)
            page.appendItem(video, "video", {
                title: "[720]-" + data.title
            });
            videoparams.sources = [{
                    url: video_url[1] + '480-' + video_url[2] + '.flv'
                }
            ]
            video = "videoparams:" + JSON.stringify(videoparams)
            page.appendItem(video, "video", {
                title: "[480]-" + data.title
            });
            videoparams.sources = [{
                    url: video_url[1] + video_url[2] + '.flv'

                }
            ]
            video = "videoparams:" + JSON.stringify(videoparams)
            page.appendItem(video, "video", {
                title: "[360]-" + data.title
            });



        }


        page.appendItem("search:" + data.title, "directory", {
            title: 'найти ' + data.title
        });
        page.type = "directory";
        page.metadata.logo = logo;
        page.loading = false;
    });

    plugin.addURI(PREFIX + ":video:(.*)", function(page, data) {
        p(PREFIX + ":play:" + (data))
        //data = JSON.parse(unescape(data));
        data = JSON.parse(unescape(data));
        page.loading = true;

        var videoparams = {
            canonicalUrl: '',
            no_fs_scan: true,
            title: data.eng_title,
            year: data.year ? data.year : 0,
            season: data.season ? data.season : -1,
            episode: data.episode ? data.episode : -1,
            sources: [{
                    url: data.video_url
                }
            ],
            subtitles: []
        };

        if (showtime.probe(data.video_url).result === 0) {
            data.video_url = undefined
            data = escape(JSON.stringify(data))
            videoparams.canonicalUrl = PREFIX + ":play:" + (data);
            p(videoparams.canonicalUrl)
            page.type = "video";
            page.source = "videoparams:" + JSON.stringify(videoparams)
        } else {
            showtime.notify('video', 3);
        }
        page.metadata.logo = logo;
        page.loading = false;
    });
    plugin.addSearcher(PREFIX + " - Videos", plugin.path + "logo.png", function(page, query) {
        try {
            showtime.trace("Search aMovies Videos for: " + query);
            var v = showtime.httpReq(BASE_URL + '/index.php?do=search', {
                debug: true,
                postdata: {
                    do :'search',
                    subaction: 'search',
                    search_start: 1,
                    full_search: 0,
                    result_from: 1,
                    story: encodeURIComponent(showtime.entityDecode(query))
                }
            });
            var re = /fullresult_search[\S\s]+?date.+?>(.+?)<[\S\s]+?src="(.+?)"[\S\s]+?href="http:\/\/amovies.tv(.+?)" >(.+?)<[\S\s]+?<span>(.*)<\//g;
            var m = re.execAll(v.toString());
            for (var i = 0; i < m.length; i++) {
                page.appendItem(PREFIX + ":page:" + m[i][3], "video", {
                    title: new showtime.RichText(m[i][4] + (m[i][5].length === 0 ? '' : ' | ' + m[i][5])),
                    icon: m[i][2],
                    description: new showtime.RichText(m[i][5] + '\n' + "Updated: " + m[i][1])
                });
                page.entries = i;
            }
        } catch (err) {
            showtime.trace('aMovies - Ошибка поиска: ' + err);
            e(err);
        }
    });





    //showtime.httpReq('https://api.vk.com/method/video.getEmbed', {args : ajaxParams}, function(result) {
    //  if (result.response) {
    //    if (!is_mobile()) {
    //      var flashvars = ['nologo=1','md_author=UPFY.ORG � Video Search'];
    //
    //      each(result.response, function(key, value) {
    //        if (key !== 'md_author' && key !== 'nologo') {
    //          flashvars.push(key + '=' + euc(value));
    //        }
    //      });
    //
    //      video_wrapper.innerHTML = '<embed type="application/x-shockwave-flash" name="video_player" width="100%" height="100%" preventhide="1" quality="high" flashvars="' + flashvars.join('&amp;') + '" allowfullscreen="true" allowscriptaccess="always" bgcolor="#000000" wmode="opaque" src="/video.swf?45">';
    //    } else {
    //      var sources = [], videos = [], poster = result.response.jpg;
    //
    //      if (result.response.cache240 || result.response.cache360 || result.response.cache480 || result.response.cache720) {
    //        each(result.response, function(key, value) {
    //          if (key == 'cache240' || key == 'cache360' || key == 'cache480' || key == 'cache720') {
    //            sources.push('<source src="'+value+'" type="video/mp4"></source>');
    //            videos.push('<a href="'+value+'">'+key.replace('cache', '')+'</a>');
    //          }
    //        });
    //      } else {
    //        each(result.response, function(key, value) {
    //          if (key == 'url240' || key == 'url360' || key == 'url480' || key == 'url720') {
    //            sources.push('<source src="'+value+'" type="video/mp4"></source>');
    //            videos.push('<a href="'+value+'">'+key.replace('url', '')+'</a>');
    //          }
    //        });
    //      }
    //
    //      video_wrapper.innerHTML = '\
    //        <video class="vv_inline_video" width="100%" height="100%" preload="none" controls="controls" poster="'+poster+'">\
    //          '+sources.join('\n')+'\
    //          <img src="'+poster+'" alt="">\
    //          <div class="vv_not_support">The device does not support HTML5 video.<br />Download video: <div class="vv_download">'+videos.join(' ')+'</div></div>\
    //        </video>';
    //    }
    //  } else {
    //    video_wrapper.innerHTML = '<iframe preventhide="0" scrolling="no" width="100%" height="100%" style="overflow: hidden;" src="' + iframeParams.src + '" frameborder="0" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>';
    //  }
    //});


    //function get_video_link(url) {
    //    var JSON, v, result_url;
    //
    //    try {
    //        p(get_video_link)
    //        p(url)
    //        //if (url.indexOf('video/embed/') != -1) {
    //        //    //http://rutube.ru/api/play/trackinfo/6624790/?_=74878716&no_404=true&format=json
    //        //    //http://rutube.ru/video/embed/6624804?p=DGxawOxbCDPdbNOEB3Cpww
    //        //    //http://rutube.ru/api/play/trackinfo/6624804?p=DGxawOxbCDPdbNOEB3Cpww&no_404=true&format=json
    //        //    result_url = url.replace('video/embed/', 'http://rutube.ru/api/play/trackinfo/') + '&no_404=true&format=json';
    //        //    p(result_url);
    //        //    JSON = JSON.parse(showtime.httpGet(result_url));
    //        //    result_url = JSON.video_balancer.m3u8 + '|' + JSON.title;
    //        //    ///.*.m3u8.*/
    //        //    title = JSON.title;
    //        //    return result_url;
    //        //}
    //        result_url = 'http://' + url;
    //        showtime.trace('php Link for page: ' + result_url);
    //        //vk.com
    //        if (url.indexOf('video_ext.php') !== -1) {
    //            v = showtime.httpGet(result_url).toString();
    //            p(v)
    //            if (v.indexOf('This video has been removed from public access.') !== -1) {
    //                result_url = undefined
    //                return result_url
    //            }
    //            JSON = (/var vars = (.+)/.exec(v)[1]);
    //            if (JSON == '{};') {
    //                result_url = /url: '(.+)'/.exec(v)[1];
    //                url = result_url.replace('video.rutube.ru', 'rutube.ru/api/play/trackinfo') + '/?format=json';
    //                JSON = JSON.parse(showtime.httpGet(url));
    //                result_url = JSON.video_balancer.m3u8;
    //                return result_url;
    //            }
    //            JSON = JSON.parse(JSON);
    //
    //            if (JSON.no_flv == 1) {
    //                p('service.Resolution: ' + service.Resolution);
    //                result_url = undefined;
    //
    //                switch (service.Resolution) {
    //                    case '0':
    //                        //if max resolution 720p
    //                        result_url = JSON.cache720
    //                        if (result_url == undefined) result_url = JSON.url720
    //                        if (result_url == undefined) result_url = JSON.cache480
    //                        if (result_url == undefined) result_url = JSON.url480
    //                        if (result_url == undefined) result_url = JSON.cache360
    //                        if (result_url == undefined) result_url = JSON.url360
    //                        if (result_url == undefined) result_url = JSON.cache240
    //                        if (result_url == undefined) result_url = JSON.url240
    //                        break;
    //                    case '1':
    //                        result_url = JSON.cache720
    //                        if (result_url == undefined) result_url = JSON.url720
    //                        if (result_url == undefined) result_url = JSON.cache480
    //                        if (result_url == undefined) result_url = JSON.url480
    //                        if (result_url == undefined) result_url = JSON.cache360
    //                        if (result_url == undefined) result_url = JSON.url360
    //                        if (result_url == undefined) result_url = JSON.cache240
    //                        if (result_url == undefined) result_url = JSON.url240
    //                        break;
    //                    case '2':
    //                        result_url = JSON.cache480
    //                        if (result_url == undefined) result_url = JSON.url480
    //                        if (result_url == undefined) result_url = JSON.cache360
    //                        if (result_url == undefined) result_url = JSON.url360
    //                        if (result_url == undefined) result_url = JSON.cache240
    //                        if (result_url == undefined) result_url = JSON.url240
    //                        break;
    //                    case '3':
    //                        result_url = JSON.cache360
    //                        if (result_url == undefined) result_url = JSON.url360
    //                        if (result_url == undefined) result_url = JSON.cache240
    //                        if (result_url == undefined) result_url = JSON.url240
    //                        break;
    //                }
    //
    //                p('result_url for:' + url + 'is ' + result_url)
    //            }
    //
    //        }
    //        // //mailru videos
    //        // if (url.indexOf('ideoapi.my.mail.ru') !== -1) {
    //        //      var sources = [];
    //        //     v = showtime.httpGet(result_url).toString();
    //        //     JSON = JSON.parse(showtime.httpGet(/metadataUrl":"([^"]+)/.exec(v)[1]));
    //        //     for (i in JSON.videos){
    //        //         sources[i] = ({url:JSON.videos[i].url,bitrate:JSON.videos[i].key})
    //        //     page.appendItem(JSON.videos[i].url, "video", { title: JSON.meta.title + "in"+ JSON.videos[i].key, duration: JSON.meta.duration, icon: JSON.meta.poster})
    //        //     }
    //        //     p('sources'+sources)
    //        //     
    //        //     
    //        //   //page.title = data.title;
    //        // //page.source = "videoparams:" + JSON.stringify({
    //        // //    //canonicalUrl: canonicalUrl,
    //        // //    ////subscan
    //        // //    //title: data.eng_title,
    //        // //    ////imdbid: imdbid ? imdbid : '<unknown>',
    //        // //    //year: data.year ? data.year : 0,
    //        // //    //season: data.season ? data.season : -1,
    //        // //    //episode: data.episode ? data.episode : -1,
    //        // //    no_fs_scan: true,
    //        // //    sources: sources
    //        // //});
    //        //     
    //        //     
    //        //     
    //        //     
    //        //     
    //        //     
    //        //// page.type = "video";    
    //        // page.type = "directory";
    //        //// page.contents = "item";
    //        //
    //        // page.loading = false;
    //        //
    //        // }
    //
    //
    //
    //        showtime.trace("Video Link: " + result_url);
    //    } catch (err) {
    //        e(err);
    //        e(err.stack);
    //    }
    //    return result_url;
    //}
    //
    //extra functions
    //
    // Add to RegExp prototype

    function getIMDBid(title) {
        p(encodeURIComponent(showtime.entityDecode(unescape(title))).toString());
        var resp = showtime.httpReq('http://www.google.com/search?q=imdb+' + encodeURIComponent(showtime.entityDecode(unescape(title))).toString()).toString();
        var re = /http:\/\/www.imdb.com\/title\/(tt\d+).*?<\/a>/;
        var imdbid = re.exec(resp);
        if (imdbid) imdbid = imdbid[1];
        else {
            re = /http:\/\/<b>imdb<\/b>.com\/title\/(tt\d+).*?\//;
            imdbid = re.exec(resp);
            if (imdbid) imdbid = imdbid[1];
        }
        return imdbid;
    }

    function get_fanart(title) {
        var v, id;
        title = trim(title);
        v = showtime.httpGet('http://www.thetvdb.com/api/GetSeries.php', {
            'seriesname': title,
            'language': 'ru'
        }).toString();
        id = match(/<seriesid>(.+?)<\/seriesid>/, v, 1);
        if (id) {
            v = (showtime.httpReq('http://www.thetvdb.com/api/0ADF8BA762FED295/series/' + id + '/banners.xml').toString());
            id = match(/<BannerPath>fanart\/original\/([^<]+)/, v, 1);
            return "http://thetvdb.com/banners/fanart/original/" + id;
        }
        return false;
    }
    // Add to RegExp prototype
    RegExp.prototype.execAll = function(e) {
        for (var c = [], b = null; null !== (b = this.exec(e));) {
            var d = [],
                a;
            for (a in b) {
                parseInt(a, 10) == a && d.push(b[a]);
            }
            c.push(d);
        }
        return c;
    };

    function match(c, a, b) {
        a = a.toString();
        b = "undefined" !== typeof b ? b : 0;
        return c.exec(a) ? c.exec(a)[b] : "";
    };

    function trim(s) {
        s = s.toString();
        s = s.replace(/(\r\n|\n|\r)/gm, "");
        s = s.replace(/(^\s*)|(\s*$)/gi, "");
        s = s.replace(/[ ]{2,}/gi, " ");
        return s;
    }
    if (!String.prototype.trim) {
        String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g, '');
        };
    }

    function e(ex) {
        t(ex);
        t("Line #" + ex.lineNumber);
    }

    function t(message) {
        showtime.trace(message, plugin.getDescriptor().id);
    }

    function p(message) {
        if (typeof(message) === 'object') message = '### object ###' + '\n' + JSON.stringify(message) + '\n' + '### object ###';
        if (service.debug) showtime.print(message);
    }

    function trace(msg) {
        if (service.debug == '1') {
            t(msg);
            p(msg);
        }
    }

    function getCookie(name, multiheaders) {
        var cookie = JSON.stringify(multiheaders['Set-Cookie']);
        p('cookie: ' + cookie);
        var matches = cookie.match(new RegExp('(?:^|; |","|")' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
        return matches ? name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=' + decodeURIComponent(matches[1]) : false;
    }
    //time stuff

    function countDelay(delay, lastRequest) {
        p("Getting difference between:" + lastRequest + " and " + Date.now());
        var timeDiff = Date.now() - lastRequest;
        p("time sinse last call:" + timeDiff);
        return timeDiff < delay ? delay - timeDiff : 0;
    };

})(this);