Dashboard = (function() {
    if (!window.location.pathname.toLowerCase().startsWith('/admin')) {
        console.warn('Acces interzis la modulul Dashboard.');
        return null; 
    }
  
    return {
        init: function() {
            console.log("Dashboard inițializat.");
        }
    };
})();


FA_Theme = window.FA_Theme || (function (w) {
    return {
        initialized: false,
        assing_vars: {},
        vars: function (k, v = {}) { this.assing_vars[k] = v },
        getVar: function (k) { return this.assing_vars[k] ?? null }
    };
})(window);
