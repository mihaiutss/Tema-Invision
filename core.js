// import { Event } from "./services/Events.js";
// import { Hooks } from "./services/Hooks.js";
import { notifications } from './module/notifications.js'; 
import { hovercard } from './module/hovercard.js';
import { user } from './module/user.js';
import { pmList } from './module/pms.js';
import { forums } from './module/forums.js';

const FATheme_core = {
    modules: {
        notifications,
        pmList,
        user,
        hovercard,
        forums,
    },

    initialized: false,
    assing_vars: window.FA_Theme?.assing_vars || {},

    init: function() {
        if (this.initialized) {
            console.warn('Notifications already initialized');
            return;
        }

        const startTime = performance.now();
        
        const results = {
            success: [],
            failed: [],
            skipped: []
        };

        console.log("%cFATheme: Starting initialization...", "color: #673AB7; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', font-size: 16px; font-weight: 600;");
        console.log("%cFATheme: Assigned variables for widgets/data:", "color: #673AB7;", this.assing_vars);

        Object.entries(this.modules).forEach(([moduleName, module]) => {
            const moduleStart = performance.now();

            if (typeof module.init === 'function') {
                try {
                    module.init();
                    
                    const moduleTime = (performance.now() - moduleStart).toFixed(2);
                    results.success.push({ name: moduleName, time: moduleTime });
                    
                    console.log(`%câœ“ ${moduleName} initialized (${moduleTime}ms)`, "color: #4CAF50; font-weight: 600;");
                } catch (e) {
                    results.failed.push({ name: moduleName, error: e.message });
                    console.error(`%câœ— Error initializing ${moduleName}:`, "color: #F44336; font-weight: bold;", e);
                }
            } else {
                results.skipped.push(moduleName);
                console.warn(`%câš  Module ${moduleName} is missing init() method`, "color: #FF9800;");
            }
        });

        const endTime = performance.now();
        const totalDuration = (endTime - startTime).toFixed(2);

        // Summary
        console.log("%cFATheme: Initialization Summary", "color: #673AB7; font-size: 14px; font-weight: 600;");
        console.log(`%câœ“ Success: ${results.success.length}`, "color: #4CAF50;");
        console.log(`%câœ— Failed: ${results.failed.length}`, "color: #F44336;");
        console.log(`%câš  Skipped: ${results.skipped.length}`, "color: #FF9800;");
        console.log(`%câ± Total time: ${totalDuration}ms`, "color: #2196F3; font-weight: 600;");

        // Detailed timing pentru module lente
        const slowModules = results.success.filter(m => parseFloat(m.time) > 100);

        if (slowModules.length > 0) {
            console.warn("%câš  Slow modules (>100ms):", "color: #FF9800; font-weight: 600;");
            slowModules.forEach(m => {
                console.warn(`  â†’ ${m.name}: ${m.time}ms`);
            });
        }

        this.initialized = true;
        return results;
    },

    vars: function(key, value = {}) {
        if (!key) return;
        this.assing_vars[key] = value; 
    },

    getVar: function(key) {
        return this.assing_vars[key] ?? null;
    },

    meta: {
        name: "FATheme_core",
        version: "1.0.0",
        author: "Staark",
        build: "#1.0.765",
    }
};

window.FA_Theme = FATheme_core;

if (window.FA_Theme && typeof window.FA_Theme.init === 'function') {
    window.FA_Theme.init();
}

(function() {
    const list = document.querySelector('ul#elFooterLinks');
    
    if (!list) {
        return;
    }
    
    let listItems = Array.from(list.querySelectorAll('a'));
    
    const priorityMap = [
        { key: 'https://www.forumgratuit.ro/', priority: 1, type: 'strict' },
        { key: 'https://help.', priority: 2, type: 'startsWith' },
        { key: '/abuse', priority: 3, type: 'includes' },
        { key: '/contact', priority: 4, type: 'includes' },
        { key: 'javascript:window.Sddan.cmp.displayUI();', priority: 5, type: 'strict' }
    ];
    
    const getItemPriority = (link) => {
        const href = link.href || '';
        const hrefAttr = link.getAttribute('href') || '';
        
        for (const rule of priorityMap) {
            switch (rule.type) {
                case 'strict':
                    if (hrefAttr === rule.key || href === rule.key) return rule.priority;
                    break;
                case 'startsWith':
                    if (href.startsWith(rule.key)) return rule.priority;
                    break;
                case 'includes':
                    if (href.includes(rule.key)) return rule.priority;
                    break;
            }
        }
        return 999;
    };
  
    listItems = listItems
        .filter(link => {
            const priority = getItemPriority(link);
            return priority < 999;
        })
        .sort((a, b) => {
            const aPriority = getItemPriority(a);
            const bPriority = getItemPriority(b);
            
            return aPriority - bPriority;
        });
    
    list.innerHTML = '';
    
    listItems.forEach((link, index) => {
        const newLi = document.createElement('li');
        newLi.appendChild(link.cloneNode(true));
        list.appendChild(newLi);
    });
})();

export default FATheme_core;
//window.FA_Events = new Event();
//window.FA_Hooks = new Hooks();
