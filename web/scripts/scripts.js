$(function() {
    $("#blockie-generator").on('input', function() {
        var wallet_regex = new RegExp('^0x[a-fA-F0-9]{40}$');
        wallet_regex.compile(wallet_regex);
        var wallet_address = $("#blockie-generator").val();
        if (wallet_regex.test(wallet_address)){
            $(".link-sm").attr("src", `https://blockies.shipchain.io/${wallet_address}.png?size=small`);
            $(".link-md").attr("src", `https://blockies.shipchain.io/${wallet_address}.png?size=medium`);
            $(".link-lg").attr("src", `https://blockies.shipchain.io/${wallet_address}.png?size=large`);
            $(".alert").hide(700);
            $(".features-blockies").show(700);
        } else if (wallet_address == '') {
            $(".alert").hide(700);
            $(".features-blockies").hide(700);
        }
        else {
            console.log("Not an address")
            $(".alert").show(700);
            $(".features-blockies").hide(700);
        }
    })
    $(".link-sm").on("click", function(){
        var copy_text =  document.createElement('textarea');
        copy_text.value = $(".link-sm").attr("src");
        document.body.appendChild(copy_text);
        copy_text.select();
        document.execCommand("copy");
        document.body.removeChild(copy_text);
        alert("Copied the link to small blockie");
    })
    $(".link-md").on("click", function(){
        var copy_text =  document.createElement('textarea');
        copy_text.value = $(".link-md").attr("src");
        document.body.appendChild(copy_text);
        copy_text.select();
        document.execCommand("copy");
        document.body.removeChild(copy_text);
        alert("Copied the link to medium blockie");
    })
    $(".link-lg").on("click", function(){
        var copy_text =  document.createElement('textarea');
        copy_text.value = $(".link-lg").attr("src");
        document.body.appendChild(copy_text);
        copy_text.select();
        document.execCommand("copy");
        document.body.removeChild(copy_text);
        alert("Copied the link to large blockie");
    })
})