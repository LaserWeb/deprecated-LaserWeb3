var profiles =
{
    "base_url": "https://raw.githubusercontent.com/LaserWeb/LaserWeb3/feature/preconfig-profiles/public/profiles/",
    "list": [
        "k40", 
        "test"
    ]
};

$("#loadprofilemodal").click(function() {
    var profiles_html = "";
    for(profile in profiles.list) {
        if (profile >= 0){
            profiles_html += "<option>" + profiles.list[profile] + "</option>";
        }
    }
    $("#preconfigprofiles").html(profiles_html);
});

$("#loadprofile").click(function() {
    var profile = $("#preconfigprofiles").find(":selected").text();
    var req_url = profiles.base_url + profile + ".json";

    $.get(req_url)
        .fail(function() {
            printLog('<b>Failed to load settings</b>', errorcolor, "settings");
        })
        .success(function(data) {
            loadSettings(data);
            printLog('<b>Loaded "' + profile + '" profile: <br>NB:</b> Please refresh page for settings to take effect', errorcolor, "settings");
        });
});