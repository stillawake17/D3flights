
document.addEventListener('DOMContentLoaded', function() {
    // Load JSON data into a variable named `data`
    
    
    d3.json('data/combined_flights_data.json').then(function(data) {
        // Process data
        data.forEach(function(d) {
            let date = new Date(d.lastSeen * 1000); // Convert to milliseconds
            d.latestTime = date;
            d.Hour = date.getHours();
            d.Minute = date.getMinutes();
    
            d.Time_Category = "Regular arrivals";
            if (d.Hour === 23 && d.Minute < 30) d.Time_Category = "Shoulder hour flights";
            else if ((d.Hour === 23 && d.Minute >= 30) || d.Hour < 6) d.Time_Category = "Night hour arrivals";
            else if (d.Hour === 6) d.Time_Category = "Shoulder hour flights";
        });
    
        let total_flights = data.length;
        let shoulder_hour_flights = data.filter(d => d.Time_Category === 'Shoulder hour flights').length;
        let night_hour_flights = data.filter(d => d.Time_Category === 'Night hour arrivals').length;
    
        // Quotas
        let quotas = [85990, 9500, 3000];
    
        // Categories and counts
        let categories = ['Total Flights', 'Shoulder Hour Flights', 'Night Hour Flights'];
        let counts = [total_flights, shoulder_hour_flights, night_hour_flights];
    // Calculating percentages
        let percentages = counts.map((count, index) => (count / quotas[index]) * 100);
       
       
    // Function to aggregate flight data by month for a given year
    function aggregateDataByMonth(flightData, year) {
        const monthlyCounts = new Array(12).fill(0); // Array for each month
        
        flightData.forEach(d => {
          let date = new Date(d.lastSeen * 1000); // Convert to milliseconds
          let flightYear = date.getFullYear();
          let flightMonth = date.getMonth(); // getMonth() returns 0-11 for Jan-Dec
          
          if (flightYear === year) {
            monthlyCounts[flightMonth]++;
          }
        });
      
        return monthlyCounts;
      }
      
    
      
      d3.select("#hide-chart-btn").on("click", function() {
        // Hide the chart container
        d3.select("#monthly-chart-container").style("display", "none");
        // Hide the hide button itself
        d3.select("#hide-chart-btn").style("display", "none");
    });
    
           // Assuming percentages is an array with values for total, shoulder, and night flights
    // and that quotas are the maximum values for each bar
    
    // Example: let percentages = [60, 45, 80]; // Percent completion for each category
    
    // Define maximum width for the progress bars (could be based on the container's width)
    const maxBarWidth = 300; // This should match the width of your progress containers
    // Define colors for each progress bar
    const barColors = {
      totalFlights: "steelblue",
      shoulderFlights: "darkorange",
      nightFlights: "green"
    };
    
    percentages = percentages.map(function(d) {
        return d.toFixed(1);  // Rounds the percentage to one decimal place
      });
    


// Assuming the gaugeScale is correctly defined
var gaugeScale = d3.scaleLinear()
    .range([-Math.PI / 2, Math.PI / 2]) // Range for a semi-circle
    .domain([0, 100]); // The data's domain

const gauges = ["total-flights-gauge", "shoulder-flights-gauge", "night-flights-gauge"];

gauges.forEach((gaugeId, i) => {
    const percentageValue = percentages[i]; // Get the current percentage value
    const percentage = parseFloat(percentageValue); // Make sure it's a number
    if (isNaN(percentage)) {
        console.error("Invalid percentage value:", percentageValue);
        return; // Skip this gauge if the value is not a number
    }

    const svg = d3.select(`#${gaugeId}`);
    const width = +svg.attr("width");
    const height = +svg.attr("height");
    const center_x = width / 2;
    const center_y = height / 2;

    var gaugeGroup = svg.append("g")
        .attr("transform", `translate(${center_x}, ${center_y})`);

    var arc = d3.arc()
        .innerRadius(70)
        .outerRadius(85)
        .startAngle(-Math.PI / 2)
        .endAngle(gaugeScale(percentage)); // Set the end angle based on the percentage

    // Append the full arc background first
    gaugeGroup.append("path")
        .datum({endAngle: Math.PI / 2}) // Full semi-circle
        .style("fill", "#ccc") // Fill with a light grey color for the gauge background
        .attr("d", arc);

    // Draw the filled arc path representing the current value
    gaugeGroup.append("path")
        .datum({endAngle: gaugeScale(percentage)})
        .style("fill", "#007bff") // Fill with a color for the filled part of the gauge
        .attr("d", arc);

    // Add needle (line element)
    const angle = gaugeScale(percentage);
    const needleLength = 70;

    gaugeGroup.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", needleLength * Math.cos(angle))
        .attr("y2", -needleLength * Math.sin(angle))
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    // Add text label for the percentage
    gaugeGroup.append("text")
        .attr("x", 0)
        .attr("y", 20) // Offset below the center
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(`${percentage.toFixed(1)}%`);
});

});
  
// Add any other elements like text, ticks, etc.
// Function to draw the bar chart for monthly data
function drawMonthlyChart(monthlyData, category) {
    // Clear any existing charts
    d3.select("#monthly-chart-container").selectAll("*").remove();

    console.log("Drawing chart for category:", category);
    console.log("Monthly data:", monthlyData);
    
    
    // Set up dimensions for the chart
    const margin = {top: 50, right: 20, bottom: 30, left: 40}, // Adjust top margin for title
    width = 600 - margin.left - margin.right, // Reduce width for a more compact chart
    height = 400 - margin.top - margin.bottom; // Reduce height for a more compact chart


    // Define color schemes
  const colorSchemes = {
    'Total Flights': 'steelblue',
    'Shoulder Hour Flights': 'darkorange',
    'Night Hour Flights': 'green'
  };

  // Use the color based on the category
  const barColor = colorSchemes[category] || 'grey'; // Fallback color if category is not found

    // Create SVG container for the chart
    const svg = d3.select("#monthly-chart-container").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          

          // Adding title to the chart
    svg.append("text")
    .attr("x", width / 2)
    .attr("y", 0 - margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("text-decoration", "underline")
    .text(`${category} - Monthly Distribution`);
  
           // Check if SVG is created properly
    console.log("SVG created with width and height:", width, height);

    // X scale - months
    const x = d3.scaleBand()
        .range([0, width])
        .padding(0.1)
        .domain(monthlyData.map((_, i) => i)); // 0-11 for Jan-Dec

    // Y scale - flight counts
    const y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(monthlyData)]);
  
// Check scales
console.log("X and Y scales set.");

    // X axis - months
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(i => d3.timeFormat("%B")(new Date(0, i)))); // Convert month number to name
  
    // Y axis - flight counts
    svg.append("g")
        .call(d3.axisLeft(y));
  
// Check axes
console.log("Axes drawn.");

    // Bars for the chart
    svg.selectAll(".bar")
        .data(monthlyData)
        .enter().append("rect")
          .attr("class", "bar")
          .attr("x", (d, i) => x(i))
          .attr("width", x.bandwidth())
          .attr("y", d => y(d))
          .attr("height", d => height - y(d))
          .style("fill", barColor); // Set the color for the bars

          // Adding data count above each bar
    svg.selectAll(".text")
        .data(monthlyData)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", (d, i) => x(i) + x.bandwidth() / 2)
        .attr("y", d => y(d) - 5)
        .attr("text-anchor", "middle")
        .text(d => d);
    // Check if bars are appended
console.log("Bars should now be visible on the chart.");


           // Make the hide button visible

     d3.select("#hide-chart-btn").style("display", "inline");
     

  }
 
  
// Make sure the full year's flight data is loaded into `flightData`

// Click event listeners for the progress bars

function attachEventListeners() {
  d3.select("#total-flights-progress").on("click", function() {
    showMonthlyChartContainer(); // Make sure the container is visible
    const totalFlightsMonthlyData = aggregateDataByMonth(data, new Date().getFullYear());
    drawMonthlyChart(totalFlightsMonthlyData, 'Total Flights');
  });

  d3.select("#shoulder-flights-progress").on("click", function() {
    showMonthlyChartContainer(); // Make sure the container is visible
    const shoulderFlightsMonthlyData = aggregateDataByMonth(
        data.filter(d => d.Time_Category === 'Shoulder hour flights'),
        new Date().getFullYear());
    drawMonthlyChart(shoulderFlightsMonthlyData, 'Shoulder Hour Flights');
  });

  d3.select("#night-flights-progress").on("click", function() {
    showMonthlyChartContainer(); // Make sure the container is visible
    const nightFlightsMonthlyData = aggregateDataByMonth(
        data.filter(d => d.Time_Category === 'Night hour arrivals'), 
        new Date().getFullYear());
    drawMonthlyChart(nightFlightsMonthlyData, 'Night Hour Flights');
  });
}

// Call the function to attach the event listeners
attachEventListeners();

}).catch(function(error) {
    console.error("Error loading the data:", error);
})

function showMonthlyChartContainer() {
  d3.select("#monthly-chart-container").style("display", "block");
  // Now it's safe to append new elements to the container
}



d3.select("#hide-chart-btn").on("click", function() {
  d3.select("#monthly-chart-container").style("display", "none");
  d3.select(this).style("display", "none");
  // No need to detach event listeners, just hide the elements
});

