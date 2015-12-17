function _whatFont() {
        var b, j, d, h, f, m, l, g;
        j = {
            STYLE_PRE: "__whatfont_",
            CSS_URL: "http://dario.tv/bookmarklet/whatfont/wf.css?ver=1.6.1",
            LINK: null,
            init: function () {
                if (j.CSS_URL) j.LINK = b("<link>").attr({
                    rel: "stylesheet",
                    href: j.CSS_URL
                }).appendTo("head")
            },
            restore: function () {
                b(j.LINK).remove()
            },
            getClassName: function (a) {
                a = typeof a === "string" ? [a] : a;
                return j.STYLE_PRE + a.join(" " + j.STYLE_PRE)
            }
        };
        d = {
            ALPHABET: "abcdefghijklmnopqrstuvwxyz",
            FILLSTYLE: "rgb(0,0,0)",
            HEIGHT: 50,
            SIZE: 40,
            TEXTBASELINE: "top",
            WIDTH: 600,
            HISTORY: {},
            init: function () {
                d.CANVAS_SUPPORT = !!b("<canvas>")[0].getContext
            },
            restore: function () {},
            mkTextPixelArray: function (a) {
                var c = b("<canvas>")[0],
                    e = c.getContext("2d");
                c.width = d.WIDTH;
                c.height = d.HEIGHT;
                e.fillStyle = d.FILLSTYLE;
                e.textBaseline = d.TEXTBASELINE;
                e.font = a.style + " " + a.variant + " " + a.weight + " " + a.letterSpacing + "px " + d.SIZE + "px " + a.family;
                e.fillText(d.ALPHABET, 0, 0);
                return e.getImageData(0, 0, d.WIDTH, d.HEIGHT).data
            },
            sameArray: function (a, b) {
                var e = d.WIDTH * d.HEIGHT * 4,
                    k;
                for (k = 0; k < e; k += 1)
                    if (a[k] !== b[k]) return !1;
                return !0
            },
            fontInUse: function (a) {
                var c = a.family.split(","),
                    e = d.mkTextPixelArray(a.family),
                    k = 0,
                    n;
                for (n = c.length; k < n; k += 1) {
                    var i = d.mkTextPixelArray(c[k]);
                    if (d.sameArray(e, i) && d.sameArray(d.mkTextPixelArray({
                            style: a.style,
                            variant: a.variant,
                            weight: a.weight,
                            letterSpacing: a.letterSpacing,
                            size: a.size,
                            family: c[k] + ",serif"
                        }), d.mkTextPixelArray({
                            style: a.style,
                            variant: a.variant,
                            weight: a.weight,
                            letterSpacing: a.letterSpacing,
                            size: a.size,
                            family: c[k] + ",sans-serif"
                        }))) return b.trim(c[k])
                }
                return "(default font)"
            },
            firstFont: function (a) {
                return b.trim(a.split(",")[0])
            },
            detect: function (a) {
                a = {
                    family: b(a).css("font-family"),
                    style: b(a).css("font-style"),
                    variant: b(a).css("font-variant"),
                    weight: b(a).css("font-weight"),
                    letterSpacing: b(a).css("letter-spacing"),
                    size: b(a).css("font-size")
                };
                return d.HISTORY[a.family] = d.HISTORY[a.family] || d.CANVAS_SUPPORT ? d.fontInUse(a) : d.firstFont(a.family)
            },
            weight: function (a) {
                return b(a).css("font-weight")
            },
            letterSpacing: function (a) {
                return b(a).css("letter-spacing")
            },
            style: function (a) {
                return b(a).css("font-style")
            },
            variant: function (a) {
                var b = {
                        bold: "Bold"
                    }[d.weight(a)] || d.weight(a),
                    a = {
                        italic: "Italic",
                        oblique: "Oblique"
                    }[d.style(a)] || d.style(a);
                return b === "normal" && a === "normal" ? "Regular" : b === "normal" ? a : a === "normal" ? b : b + " " +
                    a
            },
            getFontStyle: function (a) {
                return {
                    "font-family": b(a).css("font-family"),
                    "font-style": b(a).css("font-style"),
                    "font-weight": b(a).css("font-weight")
                }
            }
        };
        g = {
            CSS_NAME_TO_SLUG: {},
            FONT_DATA: {},
            SERVICES: {},
            init: function () {
                g.typekit();
                g.google()
            },
            typekit: function () {
                var a = function () {
                    var a = null;
                    b("script").each(function () {
                        var b = this.src.match(/use\.typekit\.com\/(.+)\.js/);
                        if (b) return a = b[1], !1
                    });
                    return a
                }();
                a && b.getJSON("https://typekit.com/api/v1/json/kits/" + a + "/published?callback=?", function (a) {
                    if (!a.errors) g.SERVICES.typekit =
                        a.kit, b.each(a.kit.families, function (a, c) {
                            b.each(c.css_names, function (a, b) {
                                g.CSS_NAME_TO_SLUG[b.toLowerCase()] = c.slug
                            });
                            g.FONT_DATA[c.slug] = g.FONT_DATA[c.slug] || {
                                name: c.name,
                                services: {}
                            };
                            g.FONT_DATA[c.slug].services.Typekit = {
                                id: c.id,
                                url: "http://typekit.com/fonts/" + c.slug
                            }
                        })
                })
            },
            google: function () {
                b("link").each(function (a, c) {
                    var e = b(c).attr("href");
                    e.indexOf("fonts.googleapis.com/css?") >= 0 && (e = e.match(/\?family=([^&]*)/)[1].split("|"), b.each(e, function (a, b) {
                        var c = b.split(":")[0],
                            e = c.replace(/\+/g, " "),
                            d = e.replace(/ /g, "-").toLowerCase();
                        g.CSS_NAME_TO_SLUG[e] = d;
                        g.FONT_DATA[d] = g.FONT_DATA[d] || {
                            name: e,
                            services: {}
                        };
                        g.FONT_DATA[d].services.Google = {
                            url: "http://www.google.com/webfonts/family?family=" + c
                        }
                    }))
                })
            },
            getFontDataByCSSName: function (a) {
                a = a.replace(/^"|'/, "").replace(/"|'$/, "");
                return (a = g.CSS_NAME_TO_SLUG[a]) && g.FONT_DATA[a] ? g.FONT_DATA[a] : null
            },
            getFontNameByCSSName: function (a) {
                a = a.replace(/^"|'/, "").replace(/"|'$/, "");
                return (a = g.CSS_NAME_TO_SLUG[a]) && g.FONT_DATA[a] ? g.FONT_DATA[a].name : null
            }
        };
        h = {
            TIP: null,
            init: function () {
                h.TIP = b.createElem("div", ["tip", "elem"], "");
                b(h.TIP).appendTo("body");
                b("body *:visible").mousemove(h.update);
                b("body").mouseout(h.hide)
            },
            restore: function () {
                b(h.TIP).remove();
                b("body :visible").unbind("mousemove", h.update);
                b("body").unbind("mousemove", h.update);
                b("body").unbind("mouseout", h.hide)
            },
            hide: function () {
                b(h.TIP).hide()
            },
            updateText: function (a) {
                b(h.TIP).text(a).css("display", "inline-block")
            },
            updatePos: function (a) {
                b(h.TIP).css({
                    top: a.pageY + 12,
                    left: a.pageX + 12
                })
            },
            updateTextPos: function (a,
                b) {
                h.updateText(a);
                h.updatePos(b)
            },
            update: function (a) {
                this.tagName === "IMG" ? h.updateTextPos(d.detect(this) + " (May be incorrect on images)", a) : this.tagName === "EMBED" ? h.updateTextPos(d.detect(this) + " (May be incorrect on Flash)", a) : h.updateTextPos(d.detect(this), a);
                a.stopPropagation()
            }
        };
        f = {
            PANELS: [],
            FONT_SERVICE_ICON: {},
            init_tmpl: function () {
                f.tmpl = function () {
                    var a = b('<div class="elem panel"><div class="panel_title"><span class="title_text"></span><a class="close_button" title="Close">&times;</a></div><div class="panel_content"><ul class="panel_properties"><li><dl class="font_family"><dt class="panel_label">Font Family</dt><dd class="panel_value"></dd></dl></li><li><div class="size_line_height clearfix"><dl class="size section"><dt class="panel_label">Font Size</dt><dd class="panel_value"></dd></dl><dl class="line_height"><dt class="panel_label">Line Height</dt><dd class="panel_value"></dd></dl><dl class="letter_spacing"><dt class="panel_label">Letter Spacing</dt><dd class="panel_value"></dd></dl></div></li><li class="panel_no_border_bottom"><dl class="type_info clearfix"><dt class="panel_label"></dt><dd class="type_preview">AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz</dd></dl><div class="font_services panel_label" style="display:none;">Font Served by </div></li></ul><div class="panel_tools clearfix"><div class="panel_tools_left"><div class="color_info"><a title="Click to change color format" class="color_info_sample">&nbsp;</a><span class="color_info_value"></span></div></div><div class="panel_tools_right"><a href="https://twitter.com/share" class="tweet_icon" target="_blank">Tweet</a></div></div></div></div>');
                    return function () {
                        return a.clone()
                    }
                }()
            },
            init: function () {
                b("body :visible").click(f.pin);
                f.init_tmpl();
                f.FONT_SERVICE_ICON.Typekit = b("<span>").addClass("service_icon service_icon_typekit").text("Typekit");
                f.FONT_SERVICE_ICON.Google = b("<span>").addClass("service_icon service_icon_google").text("Google Web Fonts")
            },
            restore: function () {
                b("body :visible").unbind("click", f.pin);
                b.each(f.PANELS, function (a, c) {
                    b(c).remove()
                })
            },
            convertClassName: function (a) {
                a.find("*").add(a).each(function (a, e) {
                    var d = b(e).attr("class");
                    if (d = d === "" ? "basic" : d + " basic") d = d.split(" "), b(e).attr("class", j.getClassName(d))
                });
                return a
            },
            typePreview: function (a, c) {
                b(c).find(".type_preview").css(d.getFontStyle(a));
                return c
            },
            fontService: function (a, c) {
                var e = d.detect(a),
                    e = g.getFontDataByCSSName(e),
                    k;
                k = b("<ul>").addClass("font_service");
                e ? (b.each(e.services, function (a, c) {
                    b("<li>").append(b("<a>").append(b(f.FONT_SERVICE_ICON[a]).clone()).attr("href", c.url).attr("target", "_blank")).appendTo(k)
                }), b(c).find(".font_services").append(k).show()) : b(c).find(".font_services").hide();
                return c
            },
            fontFam: function (a, c) {
                var e = b(a).css("font-family").replace(/;/, "").split(/,\s*/),
                    k = d.detect(a),
                    h = !1,
                    i;
                ff = b(a).css("font-family");
                fiu = d.detect(a);
                ff = ff.replace(/;/, "").split(/,\s*/);
                fiuFound = !1;
                for (i = 0; i < e.length; i += 1)
                    if (e[i] !== k) e[i] = "<span class='fniu'>" + e[i] + "</span>";
                    else {
                        e[i] = "<span class='fiu'>" + e[i] + "</span>";
                        h = !0;
                        break
                    }
                e = e.join(", ") + ";";
                h || (e += " <span class='.fiu'>" + k + "</span>");
                e = "<div class=" + j.getClassName("fontfamily_list") + ">" + e + "</div>";
                b(c).find(".font_family>dd").html(e);
                return c
            },
            sizeLineHeight: function (a, c) {
                var e = b(a).css("font-size"),
                    d = b(a).css("line-height"),
                    h = b(a).css("letter-spacing");
                b(c).find(".size>dd").text(e);
                b(c).find(".line_height>dd").text(d);
                b(c).find(".letter_spacing>dd").text(h);
                return c
            },
            color: function (a, c) {
                var e = b(a).css("color"),
                    d = b(c).find(".color_info_sample"),
                    h = b(c).find(".color_info_value"),
                    i, f, g;
                e.indexOf("rgba") !== -1 ? b(c).find(".color_info").hide() : (i = e.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/), f = parseInt(i[1], 10).toString(16), g = parseInt(i[2], 10).toString(16), i = parseInt(i[3], 10).toString(16),
                    f = f.length === 1 ? "0" + f : f, g = g.length === 1 ? "0" + g : g, i = i.length === 1 ? "0" + i : i, hex_color = "#" + f + g + i, colors = [e, hex_color], color_type = 0, d.css("background-color", e).click(function (a, b, c) {
                        return function (e) {
                            b = (b + 1) % a.length;
                            c.text(a[b]);
                            e.preventDefault();
                            return !1
                        }
                    }(colors, color_type, h)).click())
            },
            tweet: function (a, c) {
                var e = b(c).find(".tweet_icon"),
                    h = e.attr("href"),
                    f = d.detect(a),
                    f = g.getFontNameByCSSName(f) || f;
                h += "?text=" + encodeURIComponent("I like this typography design with " + f + ".") + "&via=What_Font";
                e.attr("href",
                    h)
            },
            panelContent: function (a, c) {
                b(["typePreview", "fontService", "fontFam", "sizeLineHeight", "color", "tweet"]).each(function (b, d) {
                    f[d](a, c)
                })
            },
            panelTitle: function (a, c) {
                var e = d.detect(a),
                    e = (g.getFontNameByCSSName(e) || e) + " - " + d.variant(a);
                b(c).find(".title_text").html(e).css(d.getFontStyle(a));
                (function (a) {
                    b(a).find(".close_button").click(function (c) {
                        b(a).remove();
                        c.stopPropagation();
                        return !1
                    })
                })(c);
                return c
            },
            get: function (a) {
                var c = f.tmpl();
                f.panelTitle(a, c);
                f.panelContent(a, c);
                f.convertClassName(c);
                b(c).click(function () {
                    b(this).find("*").css("-webkit-animation",
                        "none");
                    b(this).detach();
                    b(this).appendTo("body")
                });
                return c
            },
            pin: function (a) {
                var c;
                h.hide();
                c = f.get(this);
                b(c).css({
                    top: a.pageY + 12,
                    left: a.pageX - 13
                }).appendTo("body");
                f.PANELS.push(c);
                a.stopPropagation();
                a.preventDefault()
            }
        };
        m = {
            TOOLBAR: null,
            init: function () {
                var a = b.createElem("div", "exit", "Exit WhatFont");
                b.createElem("div", "help", "<strong>Hover</strong> to identify<br /><strong>Click</strong> to pin a detail panel");
                m.TOOLBAR = b("<div>").addClass(j.getClassName(["elem", "control"])).append(a).appendTo("body");
                b(a).click(function () {
                    l.restore()
                })
            },
            restore: function () {
                b(m.TOOLBAR).remove()
            }
        };
        l = {
            shortcut: function (a) {
                if ((a.keyCode || a.which) === 27) l.restore(), a.stopPropagation()
            },
            restore: function () {
                b("body :visible").unbind("mousemove", l.updateTip);
                b("body :visible").unbind("click", l.pinPanel);
                d.restore();
                m.restore();
                h.restore();
                f.restore();
                j.restore();
                b("body").unbind("keydown", l.shortcut);
                _WHATFONT = !1
            },
            init: function () {
                !b && jQuery && (b = jQuery);
                if (typeof _WHATFONT !== "undefined" && _WHATFONT || !b) return !1;
                _WHATFONT = !0;
                b.createElem = function (a, c, e, d) {
                    var f = b("<" + a + ">"),
                        c = c || [],
                        e = e || "",
                        c = typeof c === "string" ? [c] : c;
                    c.push("basic");
                    f.addClass(j.getClassName(c));
                    typeof e === "string" ? f.html(e) : e.constructor === Array ? b.map(e, function (a) {
                        return f.append(a)
                    }) : f.append(e);
                    f.attr(d);
                    return f[0]
                };
                j.init();
                d.init();
                h.init();
                f.init();
                m.init();
                g.init();
                b("body").keydown(l.shortcut)
            }
        };
        return {
            setJQuery: function (a) {
                b = a
            },
            setCSSURL: function (a) {
                j.CSS_URL = a
            },
            getVer: function () {
                return "1.6.1"
            },
            init: function () {
                l.init()
            },
            restore: function () {
                l.restore()
            }
        }
    }
    (function () {
        function b() {
            (function () {
                var b = document.createElement("script");
                b.type = "text/javascript";
                b.async = !0;
                b.src = "https://ssl.google-analytics.com/ga.js";
                var d = document.getElementsByTagName("script")[0];
                d.parentNode.insertBefore(b, d);
                d.onload = function () {
                    _gat._createTracker("UA-23020717-1", "wf")._trackEvent("bookmarklet", "loaded", j.getVer())
                }
            })()
        }
        var j, d;
        j = _whatFont();
        d = window.document.createElement("script");
        d.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.min.js";
        d.onload = function () {
            j.setJQuery(jQuery.noConflict(!0));
            j.init();
            b()
        };
        window.document.getElementsByTagName("head")[0].appendChild(d)
    })();