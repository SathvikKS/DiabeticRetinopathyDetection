$(document).ready(function () {
    let base64Image;
    // Init
    $('.image-section').hide();
    $('.loader').hide();
    $('#result').hide();

    // Upload Preview
    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                let dataURL = reader.result;
                base64Image = dataURL.replace("data:image/jpeg;base64,","");
                $('#imagePreview').css('background-image', 'url(' + e.target.result + ')');
                $('#imagePreview').hide();
                $('#imagePreview').fadeIn(650);
            }
            reader.readAsDataURL(input.files[0]);
            $('#result').hide();
            $('#btn-predict').show()
        }
    }
    $("#imageUpload").change(function () {
        $('.image-section').show();
        $('#btn-predict').show();
        $('#result').text('');
        $('#result').hide();
        readURL(this);
    });

    // Predict
    $('#btn-predict').click(async function () {
        var form_data = new FormData($('#upload-file')[0]);
        let message = {
            image: base64Image
        }
        // Show loading animation
        $(this).hide();
        $("#imageUpload").prop('disabled', true);
        $('.loader').show();
        $.ajax({
            type: 'POST',
            url: '/predict',
            data: JSON.stringify(message),
            contentType: false,
            cache: false,
            processData: false,
            async: true,
            success: function (data) {
                // Get and display the result
                var res = []
                data.pres.forEach(element => {
                    res.push(`Predicted stage ${element[0]}: ${element[1].toFixed(2)} % (${element[2]})`)
                });
                $('.loader').hide();
                $("#imageUpload").prop('disabled', false);
                $('#result').fadeIn(600);
                $('#result').html(' Result:  <br>' + res.join('<br>'));
                console.log(res)
                
            },
        });
    });

});
