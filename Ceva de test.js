function faGetNotificationList() {
    if (!FA || !FA.Notification || !FA.Notification.getStore) {
        console.log("FA sau FA.Notification.getStore lipsește.");
        return [];
    }

    var store = FA.Notification.getStore() || {};
    var items = [];
    var totalStoreCount = 0;

    for (var id in store) {
        if (!store.hasOwnProperty(id)) continue;
        totalStoreCount++;
        var n = store[id];
        
        // 1. Verificăm obiectul de bază
        if (!n) {
            console.log("???? OMIS: Notificarea cu ID-ul " + id + " este NULL/UNDEFINED.");
            continue; 
        }

        // 2. Verificăm proprietățile esențiale folosite în funcția originală
        var textProps = n.text || {};
        
        if (!textProps.id || !textProps.type) {
             console.log("⚠️ ATENȚIE: Notificarea cu ID-ul " + id + " nu are text.id sau text.type.");
             // Logăm obiectul complet pentru inspecție
             // console.log(n);
        }
        
        // ** Am relaxat condiția strictă de filtrare, acceptăm notificarea chiar dacă îi lipsesc 'text.id' sau 'text.type' **
        // Dacă dorești să le accepți pe toate, șterge COMPLET linia de filtrare!

        items.push({
            id: textProps.id, 
            type: textProps.type,
            
            read: !!n.read,
            channel: n.channel,
            time: n.time || null,
            raw: n
        });
    }
    
    console.log("--- REZUMAT ---");
    console.log("Total obiecte în Store: " + totalStoreCount);
    console.log("Notificări returnate (după procesare): " + items.length);
    console.log("-----------------");

    // Sortarea rămâne aceeași
    items.sort(function (a, b) {
        if (!a.time || !b.time) return 0;
        return a.time > b.time ? -1 : 1;
    });

    return items; 
}
  
function getNotifIconClass(type) {
    switch (type) {
        case FA.Notification.NOTIF_LIKE:              return 'fa-thumbs-up text-green-600';
        case FA.Notification.NOTIF_DISLIKE:           return 'fa-thumbs-down text-red-600';
        case FA.Notification.NOTIF_MENTION:           return 'fa-at text-blue-600';
        case FA.Notification.NOTIF_PRIV_MSG:          return 'fa-envelope text-blue-500';
        case FA.Notification.NOTIF_TOPIC_WATCH:       return 'fa-eye text-indigo-600';
        case FA.Notification.NOTIF_FORUM_WATCH:       return 'fa-book-open text-indigo-600';
        case FA.Notification.NOTIF_AWARD:             return 'fa-trophy text-amber-500';
        case FA.Notification.NOTIF_DONATION:          return 'fa-donate text-green-700';
        case FA.Notification.NOTIF_FRIEND_REQ:        return 'fa-user-plus text-blue-500';
        case FA.Notification.NOTIF_FRIEND_CON:        return 'fa-user-friends text-blue-600';
        case FA.Notification.NOTIF_REPORT:            return 'fa-flag text-red-500';
        case FA.Notification.NOTIF_ADVERT:            return 'fa-bullhorn text-purple-500';
        case FA.Notification.NOTIF_WALL_MSG:          return 'fa-comment-dots text-teal-500';
        case FA.Notification.NOTIF_HASHTAG:           return 'fa-hashtag text-teal-600';
        case FA.Notification.NOTIF_FOLLOWER_NEW_POST: return 'fa-comments text-blue-600';
        case FA.Notification.NOTIF_FOLLOWER_NEW_TOPIC:return 'fa-file-alt text-blue-600';

        default: return 'fa-bell text-gray-500';
    }
}

function formatRelativeTime(dt){
    if (!dt) return '';

    const seconds = Math.floor(Date.now() / 1000) - dt;

    const units = [
        { s: 60,      name: " secounds ago" },
        { s: 3600,    name: " minutes ago" },
        { s: 86400,   name: " hours ago" },
        { s: 604800,  name: " days ago"   },
        { s: 2592000, name: " weeks ago" },
        { s: 31536000,name: " months ago"   },
        { s: Infinity,name: " years ago"    }
    ];

    if (seconds < 60) return `acum ${seconds} sec`;

    let idx = 0;
    while (seconds > units[idx].s) idx++;

    const value = Math.floor(seconds / (units[idx - 1]?.s || 1));

    return `acum ${value} ${units[idx - 1].name}`;
}

function faBuildNotifMain(n) {
    var t     = n.raw.text || {};
    var z     = n.raw || {};
    var post  = t.post || null;
    var award = t.award || null;
    var from  = t.from || {};
    var title = '';
    var url   = '#';
  console.log(n.raw);

    // 1) URL-ul notificării
    if (post) {
        url =
            '/t' + post.topic_id +
            (post.post_id ? 'p' + post.start : '') +
            '-' + post.topic_name +
            (post.post_id ? '#' + post.post_id : '');
    } else if (award) {
        if (window._userdata && _userdata.user_id && _userdata.username) {
            url = '/u' + _userdata.user_id + '/badges/';
        }
    } else if (t.type === FA.Notification.NOTIF_PRIV_MSG) {
        url = '/privmsg';
    }

    var iso = null;
    if (typeof t.dt === 'number') {
        var d = new Date(t.dt * 1000);
        iso = d.toISOString();
    }

    var displayFull  = z.time || '';   // "Lun 24 Noi 2025 - 19:15"
    var displayShort = formatRelativeTime(t.dt);    // deocamdată la fel

    var timeHtml = '';
    if (iso) {
        var safeFull  = displayFull.replace(/"/g, '&quot;');
        var safeShort = displayShort.replace(/"/g, '&quot;');
        timeHtml =
            '<time datetime="' + iso + '"' +
                (safeFull ? ' title="' + safeFull + '"' : '') +
                (safeShort ? ' data-short="' + safeShort + '"' : '') +
            '>' +
                (safeShort || safeFull || iso) +
            '</time>';
    }

    // 3) TITLUL – aici folosim t.type cu constantele FA.Notification
    var topicTitle = post && (post.topic_display_name || post.topic_name) || '';
    var fromName   = from.name || 'Un utilizator';

    switch (t.type) {
        case FA.Notification.NOTIF_LIKE:             // 11
            title = fromName + ' a apreciat postarea ta în „' + topicTitle + '”';
            break;

        case FA.Notification.NOTIF_DISLIKE:          // 12
            title = fromName + ' a reacționat negativ la postarea ta în „' + topicTitle + '”';
            break;

        case FA.Notification.NOTIF_MENTION:          // 8
            title = fromName + ' te-a menționat în „' + topicTitle + '”';
            break;

        case FA.Notification.NOTIF_TOPIC_WATCH:      // 7
            title = 'Există activitate nouă în topicul „' + topicTitle + '”';
            break;

        case FA.Notification.NOTIF_FORUM_WATCH:      // 13
            title = 'Există activitate nouă în forumul urmărit „' + (post && post.forum_name || '') + '”';
            break;

        case FA.Notification.NOTIF_PRIV_MSG:         // 0
            title = 'Ai un mesaj privat nou de la ' + fromName;
            break;

        case FA.Notification.NOTIF_AWARD:            // 14
            title = award.award_notif || ('Ai primit o recompensă de la ' + fromName);
            break;

        case FA.Notification.NOTIF_DONATION:         // 17
            title = 'Mulțumim! Ai primit o donație.';
            break;

        case FA.Notification.NOTIF_FOLLOWER_NEW_TOPIC: // 15
            title = fromName + ' a deschis un topic nou: „' + topicTitle + '”';
            break;

        case FA.Notification.NOTIF_FOLLOWER_NEW_POST:  // 16
            title = fromName + ' a postat ceva nou în „' + topicTitle + '”';
            break;

        default:
            if (topicTitle) {
                title = 'Activitate nouă în „' + topicTitle + '”';
            } else {
                title = 'Ai o notificare nouă';
            }
            break;
    }

    return '' +
        '<div class="ipsDataItem_main">' +
            '<a href="' + url + '">' +
                '<span class="ipsDataItem_title ipsType_break">' + title + '</span>' +
                '<br>' +
                '<span class="ipsType_light">' +
                    (timeHtml || '') +
                '</span>' +
            '</a>' +
        '</div>';
}

function faRenderNotifyList() {
    var items = faGetNotificationList();
    var $list = $('#elNotifyContent');

    if (!items.length) {
        $list.html(
            '<li class="ipsDataItem">' +
                '<div class="ipsType_light ipsType_center">Nu ai notificări noi.</div>' +
            '</li>'
        );
        return;
    }

    var html = '';

    items.forEach(function (n) {
        var baseClass = 'ipsDataItem';
        if (!n.read) {
            baseClass = 'ipsDataItem ipsDataItem_unread';
        }

        // ===== AVATAR / ICON (la fel ca înainte) =====
        var t = n.raw.text || {};

        var userName =
            (t.user && t.user.name) ||
            t.author_name ||
            t.username ||
            'User';

        var profileUrl =
            (t.user && t.user.url) ||
            t.author_url ||
            t.profile_url ||
            '#';

        var avatarUrl =
            (t.user && (t.user.photo || t.user.avatar)) ||
            t.author_avatar ||
            t.avatar ||
            'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%201024%201024%22%20style%3D%22background%3A%23b262c4%22%3E%3Cg%3E%3Ctext%20text-anchor%3D%22middle%22%20dy%3D%22.35em%22%20x%3D%22512%22%20y%3D%22512%22%20fill%3D%22%23ffffff%22%20font-size%3D%22700%22%20font-family%3D%22-apple-system%2C%20BlinkMacSystemFont%2C%20BlinkMacSystemFont%2C%20Roboto%2C%20Helvetica%2C%20Arial%2C%20sans-serif%22%3E' + encodeURIComponent(userName.charAt(0).toUpperCase()) + '%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fsvg%3E';

        var hoverId = 'ips_uid_' + n.id + '_notif';
        var hoverTarget = profileUrl && profileUrl !== '#'
            ? profileUrl + (profileUrl.indexOf('?') === -1 ? '/?do=hovercard' : '&do=hovercard')
            : '';

        if(t?.type === 14 && (t.award && t.award.award_image)) {
          var avatarHtml = `
              <div class="ipsDataItem_icon">
                <img src="${t.award.award_image}" loading="lazy" class="award_image" wigth="44" height="44" />
              </div>
          `;
        } else {
          var avatarHtml =
              '<div class="ipsDataItem_icon">' +
                  '<a href="' + profileUrl + '" rel="nofollow"' +
                      (hoverTarget ? ' data-ipshover="" data-ipshover-width="370" data-ipshover-target="' + hoverTarget + '"' : '') +
                      ' class="ipsUserPhoto ipsUserPhoto_mini"' +
                      ' title="Go to ' + userName.replace(/"/g, '&quot;') + '\'s profile"' +
                      ' id="' + hoverId + '">' +
                      '<img src="' + avatarUrl + '" alt="' + userName.replace(/"/g, '&quot;') + '" loading="lazy">' +
                  '</a>' +
              '</div>';
        }
        // ===== CONȚINUTUL PRINCIPAL AL NOTIFICĂRII =====
        var mainHtml = faBuildNotifMain(n);

        // li final
        html += '' +
            '<li class="' + baseClass + '" id="n' + n.id + '" data-notif-id="' + n.id + '">' +
                avatarHtml +
                mainHtml +
            '</li>';
    });

    $list.html(html);
}
  
function faUpdateNotifBadge() {
    var items = faGetNotificationList();
    var unread = items.filter(function (n) { return !n.read; }).length;

    var $badge = $('.ipsNotificationCount[data-notificationtype="notify"]');

    if (unread > 0) {
        $badge
            .text(unread)
            .removeClass('ipsHide')
            .attr('data-currentcount', unread);
    } else {
        $badge
            .addClass('ipsHide')
            .text('0')
            .attr('data-currentcount', '0');
    }
}

$(function () {
    if (FA && FA.Notification && FA.Notification.registered && FA.Notification.registered()) {
        faRenderNotifyList();
        faUpdateNotifBadge();
    }

    $(document).on('click', '#elFullNotifications', function (e) {
        e.preventDefault();   // <- AICI oprești redirectul
        e.stopPropagation();  // să nu se considere click „pe afară”
        $('#elFullNotifications_menu')
        .toggleClass('ipsHide')
        .css({
            'z-index': 99999,
            'width': '400px'
        });
        setTimeout(function () {
            faRenderNotifyList();
            faUpdateNotifBadge();
        }, 50);
    });

    $(document).on('click', '[data-role="markAllNotifyRead"]', function (e) {
        e.preventDefault();
        if (FA && FA.Notification && FA.Notification.markAsRead) {
            FA.Notification.markAsRead();
            setTimeout(function () {
                faRenderNotifyList();
                faUpdateNotifBadge();
            }, 400);
        }
    });
});
