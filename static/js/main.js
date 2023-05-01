let barChart;
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
                base64Image = dataURL.replace("data:image/jpeg;base64,", "");
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
                $('.loader').hide();
                $("#imageUpload").prop('disabled', false);
                data = data.pres.map(item => `${item[0]}: ${item[1].toFixed(2)}`);

                // Extract labels and values from the data
                const labels = data.map(item => item.split(':')[0]);
                const values = data.map(item => parseFloat(item.split(':')[1]));

                // Get the canvas element for the chart
                const ctx = document.getElementById('pieChart').getContext('2d');

                if (barChart) {
                    barChart.destroy();
                }
                
                // Create the bar chart
                barChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Disease Levels', // Add a label for the dataset
                            data: values,
                            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }

                });

            },
        })
    })
});
