// helper 
var _h = {
    getWidth: function (el) {
        if (el.offsetWidth !== undefined)
            return el.offsetWidth;
        return parseInt(window.getComputedStyle(el).width);
    },
    getHeight: function (el) {
        if (el.offsetHeight !== undefined)
            return el.offsetHeight;
        return parseInt(window.getComputedStyle(el).height);
    },
    getOffsetRect: function (el) {
        var r = el.getBoundingClientRect(),
            b = document.body,
            d = document.documentElement,
            t = (window.pageYOffset || d.scrollTop || b.scrollTop) - (d.clientTop || b.clientTop || 0),
            l = (window.pageXOffset || d.scrollLeft || b.scrollLeft) - (d.clientLeft || b.clientLeft || 0);
        return { top: Math.round(r.top + t), left: Math.round(r.left + l), bottom: Math.round(r.bottom + t), right: Math.round(r.right + l), width: r.width, height: r.height };
    },
    searchParentByClass: function (el, c) {
        return (el = el.parentNode) === document ? undefined : el.classList.contains(c) ? el : this.searchParentByClass(el, c);
    },
    create: function (n, o) {
        var el = document.createElement(n);
        for (var k in o)
            this[k] === undefined ? el[k] = o[k] : this[k](el, o[k]);
        return el;
    },
    attr: function (el, o) {
        for (var k in o)
            el.setAttribute(k, o[k]);
    },
    css: function (el, o) {
        for (var k in o)
            el.style[k] = o[k];
    },
    event: function (el, o) {
        for (var k in o)
            el.addEventListener(k, o[k], false);
    },
    dataset: function (el, o) {
        for (var k in o)
            el.dataset[k] = o[k]; 
    }
}
// create app
var app = {
    device: {
        orientation: window.innerHeight / window.innerWidth > 1 ? 'portrait' : 'landscape',
        isMobile: (function () {
            var k = navigator.userAgent, a = 'indexOf';
            return (-1 != k[a]("Mobile") && -1 != k[a]("WebKit") && -1 == k[a]("iPad") || -1 != k[a]("Opera Mini") || -1 != k[a]("IEMobile"));
        })()
    },
    eventsManager: new (function () {
        var funcs = {};
        this.add = function (type, func) {
            if (!funcs[type]) {
                funcs[type] = new Array();
                addEventListener(type, function (e) {
                    funcs[type].forEach(function (f) { f(e); });
                });
            }
            funcs[type].push(func);
        }
        this.del = function (type, func) {
            var arr = funcs[type];
            if (arr) {
                var i = arr.indexOf(func);
                if(i > -1)
                    arr.splice(i, 1);
            }
        }
    })(),
    global: {
        clearTrash: function () {
            var d = this.html, b = this.body, h = this.head;          
            // remove blogger attributes
            d.removeAttribute('xmlns:expr');
            d.removeAttribute('xmlns:data');
            d.removeAttribute('xmlns:b');
            d.removeAttribute('xmlns');
            d.removeAttribute('class');
            //remove blogger scripts before </body>
            for (var i = 0; i < 3; b.removeChild(b.lastChild), i++);
            //remove blogger styles and scripts in head
            for (var i = 0; i < 3; h.removeChild(h.lastChild), i++);
            for (var i = 0, t = h.querySelector('title') ; i < 3; h.removeChild(t.nextSibling), i++);
            h.removeChild(document.getElementById('page-skin-1'));
        },
        getBlogContext: function (el) {
            el = el || document.body;
            var d = el.lastChild.previousSibling.data;
            eval('var blog=' + d.substring(d.indexOf('_SetDataContext') + 42, d.indexOf("}, {'name': 'skin'")));
            if (el === document.body) this.clearTrash();
            return blog;
        },
    },
    sideBar: new (function () {
        var sb = null, currentTab = null, isOpen = false;
        var bg = ''; // test

        function closeTab() {
            if (!currentTab) return;
            document.getElementById(currentTab.dataset.tabId).classList.remove('open-tab');
            currentTab.classList.remove('cur-sb-tab');
            // bad implement ;-( / work with pseudo-elements (after,before)
            bg = '';
            var ch = document.getElementById('css-tab-color');
            if (ch)
                sb.removeChild(ch);
            //---------------------
        }
        function openTab() {
            var agine = currentTab === this;
            if (this.classList.contains('right-arrow')) {
                if (!isOpen || agine) toggle();
            }
            if (agine) return;
            closeTab();
            currentTab = this;
            currentTab.classList.add('cur-sb-tab');
            document.getElementById(currentTab.dataset.tabId).classList.add('open-tab');
            // bad implement ;-( / work with pseudo-elements (after,before)
            if (this.dataset.tabColor)
                bg = this.dataset.tabColor;
            if (bg !== '') {
                var css = document.createElement('style'),
                    str = '.cur-sb-tab.right-arrow:after{border-right-color:' + bg + '}.cur-sb-tab.bottom-arrow:after{border-bottom-color:' + bg + '}.tabs-cont{background:' + bg + ' !important}';
                css.id = 'css-tab-color';
                css.appendChild(document.createTextNode(str));
                sb.appendChild(css);
            }
            //--------------------------------
        }
        this.toggle = function (flag) {
            console.log(flag, !isOpen);
            toggle(null, flag || !isOpen);
        }
        function toggle(e, flag) {
            console.log(flag, !isOpen);
            flag = flag || !isOpen;
            var w = wrap;

            // hack? / add-delete animation classies for beutiful :-)
            sb.classList.add('toggle-anim');
            w.classList.add('toggle-sb-anim');
            setTimeout(function () {
                sb.classList.remove('toggle-anim');
                w.classList.remove('toggle-sb-anim');
            }, 205);
            //---------------

            sb.classList.toggle('open');
            w.classList.toggle('open-sb');
            isOpen = flag;

            if (currentTab.classList.contains('right-arrow'))
                currentTab.classList[flag ? 'add' : 'remove']('cur-sb-tab');

            console.log('sideBar status:', isOpen);
        }
        this.openTab = function (el) {
            if (typeof el === 'string')
                el = sb.querySelector('.' + el + '-btn');
            openTab.call(el);
        }
        this.setLocation = function () {
            var hh = _h.getHeight(document.getElementsByTagName('header')[0]),
                ih = innerHeight;
            if (window.pageYOffset >= hh) {
                sb.style.top = 0;
                sb.style.height = ih + 'px';
            }
            else {
                var h = hh - window.pageYOffset;
                sb.style.top = h + 'px';
                sb.style.height = (ih - h) + 'px';
            }
        }
        this.addNavButton = function (opt) {
            var p = sb.querySelector('.' + opt.loc + '-btns'),
                    a = p.children, l = a.length,
                    b = a[opt.loc === 'top' ? opt.pos : l - opt.pos - 1],
                    cn = 'btn ' + opt.name + '-btn';
            if (!b) {
                for (var i = 0, c = opt.pos - l + 1; i < c; i++) {
                    var li = document.createElement('li');
                    li.className = 'btn empty-btn';
                    opt.loc === 'top' ? p.appendChild(li) : p.insertBefore(li, p.firstChild);
                }
                l = a.length;
                b = a[opt.loc === 'top' ? opt.pos : l - opt.pos - 1];
            }
            b.innerHTML = opt.innerHTML;
            if (opt.tabId) {
                cn += ' right-arrow tab-btn';
                b.dataset.tabId = opt.tabId;
                b.addEventListener('click', openTab);

                if (opt.tabColor) // test
                    b.dataset.tabColor = opt.tabColor;
            }
            else
                b.className = 'btn';
            if (opt.func)
                b.addEventListener('click', opt.func);
            b.className = cn;
            return b;
        }
        this.delNavButtton = function (name) {
            var el = sb.querySelector('.' + name + '-btn'),
                p = el.parentNode,
                li = document.createElement('li');
            li.className = 'btn empty-btn';
            p.replaceChild(li, el);
        }
        this.hideNavButtton = function (name) {
            var el = sb.querySelector('.' + name + '-btn');
            if (el) el.style.visibility = 'hidden'
        }
        this.showNavButtton = function (name) {
            var el = sb.querySelector('.' + name + '-btn');
            if (el) el.style.visibility = 'visible';
        }

        function toggleNav() {
            this.title = (this.classList.toggle('close') ? 'Show' : 'Hide') + ' navigation panel';
            sb.querySelector('.tabs-nav').classList.toggle('hide-top-nav');
        }

        this.start = function (el) {
            if (currentTab)
                return;
            sb = document.getElementById('sidebar');
            
            if (!app.device.isMobile && innerWidth > 899) {
                isOpen = true;
                document.getElementById('wrap').classList.add('open-sb');
                document.getElementById('sidebar').classList.add('open');
            }

            this.setLocation();

            var btns = sb.querySelectorAll('.tab-btn');
            [].forEach.call(btns, function (el) {
                el.addEventListener('click', openTab);
            });
            sb.querySelector('.toggle-sb-btn').addEventListener('click', toggle);
            if (el) openTab.call(el);

            app.eventsManager.add('scroll', this.setLocation);

            // add toggle navigation button
            var tc = sb.querySelector('.tabs');
                span = document.createElement('span');
            span.innerHTML = '<svg><use xlink:href="#icon-top-arrow"></use></svg>';
            span.title = 'Show navigation panel';
            span.className = 'toggle-nav';
            span.onclick = toggleNav;
            tc.insertBefore(span, tc.firstChild);
        }
    })(),
    setts: (function () {
        var m = Math.max(screen.height, screen.width),
            obj = {
                ppis: Math.round((m / 2.5) / 100) * 100, // prev post image size
                fpis: Math.round((m / 2) / 100) * 100, // full post image size
                isDOMLoaded : false
            }
        return obj;
    })()
};

app.global.domLoaded = function () {
    app.setts.isDOMLoaded = true;
    //add classies
    //if (!app.device.isMobile && innerWidth > 899) { // change?
    //    //document.getElementById('wrap').classList.add('open-sb');
    //    //document.getElementById('sidebar').classList.add('open');
    //}
    setTimeout(function () {
        document.getElementById('wrap').classList.add('toggle-sb-anim');
        document.getElementById('sidebar').classList.add('toggle-anim');
        document.querySelector('#sidebar .tabs-nav').classList.add('all-short-anim');       
        document.querySelector('#sidebar .tabs-cont').classList.add('bg-color-anim');
        //document.body.classList.add('sb-atop')
    }, 500);
    //
    app.global.html = document.lastChild;
    app.global.head = document.head;
    app.global.body = document.body;
    //get blog context
    app.blogInfo = app.global.getBlogContext();

    app.eventsManager.add('resize', app.sideBar.setLocation);

    // copy svg elements
    app.SVG.copySVG();
}
app.eventsManager.add('DOMContentLoaded', app.global.domLoaded);

// ----------------------- work with SVG (bad implement?)
app.SVG = {
    copySVG: function () {
        var uses = document.querySelectorAll('use');
        for (var i = 0, g, u; u = uses[i]; i++) {
            var svg = u.parentNode, symbol = document.getElementById(u.getAttribute('xlink:href').replace('#', ''));
            svg.removeChild(u);
            app.SVG.copyAttributes(svg, symbol, { id: 'class' });
            svg.appendChild(app.SVG.copyElem(symbol, {
                tagName: 'g',
                copyAttr: false
            }));
        }
    },
    innerSVG : function(el, str) {
        if (el.innerHTML)
            el.innerHTML += str;
        else {
            var ch, tmp = document.createElement('div');
            tmp.innerHTML = '<svg>' + str + '</svg>';
            tmp = tmp.firstChild;
            //app.SVG.copyAttributes(tmp, el);
            while (ch = tmp.firstChild)
                el.appendChild(ch);
        }
    },
    copyAttributes: function ($new, old, change) {
        if (old.attributes) {
            for (var i = 0, n, a; a = old.attributes[i]; i++) {
                n = a.nodeName;
                for (var k in change) {
                    if (a.nodeName === k)
                        n = change[k];
                }
                $new.setAttribute(n, a.value);
            }
        }
    },
    copyElem: function (old, change) {
        var name = change.tagName || old.tagName,
            ns = change.namespaceURI || old.namespaceURI,
            $new = document.createElementNS(ns, name);
        if (change.copyAttr)
            app.SVG.copyAttributes($new, old);
        if (old.childNodes) {
            for (var i = 0, ch; ch = old.childNodes[i]; i++) {
                if (ch.nodeType === 1)
                    $new.appendChild(app.SVG.copyElem(ch, {copyAttr:true}));
            }
        }
        return $new;
    }
};
