import * as d3 from 'd3';

export async function createChart(element){
    const data = await d3.csv('data/nba_check_in.csv', (d)=>{
        return {
           rk: Number(d.RK),
           team:d.TEAM,
           pace: Number(d.PACE),
           ast:Number(d.AST),
           to:Number(d.TO),
           orr:Number(d.ORR),
           rebr: Number(d.REBR),
           drr: Number(d.DRR),
           eff_fg_perc:Number(d.EFFFG),
           ts_perc:Number(d.TS),
           off_eff:Number(d.OFF_EFF),
           def_eff: Number(d.DEF_EFF),
      
        }
     })

    const margin ={t:25,r:25,b:25,l:25};
    const height = 900 - (margin.t + margin.b);
    const width = 900 - (margin.l + margin.r);
    const svg = d3.select(element).append('svg').attr('height', height + (margin.r + margin.l)).attr('width', width + (margin.l + margin.r));
  
    const mainG = svg.append('g').attr('transform', `translate(${margin.l},${margin.t})`)

   //average
    const avgO = d3.mean(data.map(d=>d.off_eff));
    const avgD = d3.mean(data.map(d=>d.def_eff));

    //scales

    const xScale = d3.scaleLinear([100,122],[width,0]).nice();

    console.log(d3.extent(data,d=>d.def_eff));

    const yScale = d3.scaleLinear([100,122],[height,0]).nice();

    //axis

    mainG.append('g').attr('class', 'y-axis').call(d3.axisLeft(yScale));

    mainG.append('g').attr('class', 'x-axis')
                        .attr('transform', `translate(0, ${height})`)
                        .call(d3.axisBottom(xScale))
                        // .call(g => g.selectAll(".tick line").clone()
                        // .attr("y1", -height)
                        // .attr("stroke-opacity", 0.1));

     //bins 
     const defBin = d3.bin().domain([100, 122]).thresholds(10).value(d=>d.def_eff)(data);
    
     const offBin = d3.bin().domain([100, 122]).thresholds(10).value(d=>d.off_eff)(data);
     
     
     
     
     const xdefBinScale = d3.scaleLinear()
       .domain([defBin[0].x0, defBin[defBin.length - 1].x1])
       .range([width, 0]).nice();

       
 
   // Declare the y (vertical position) scale.
   const ydefBinScale = d3.scaleLinear()
       .domain([0, d3.max(defBin, (d) => d.length)])
       .range([height, yScale(104)]).nice();


    //y histogram scale

    const xscaleOff = d3.scaleLinear()
                    .domain([0, d3.max(defBin, (d) => d.length)])
                    .range([0, xScale(116)]).nice();
        
 


    //visuals 

    const imageWidth = 75;

    const testData = data.filter(d=> d.team === "Oklahoma_City");

    // avg lines

    mainG.append('g').selectAll().data([avgO]).join('line')
    .attr('x1', 0)
    .attr('x2', width)
    .attr('y1', d=>yScale(d))
    .attr('y2', d=>yScale(d))
    .attr('stroke', 'grey')
    .attr('stroke-width', '1px')
    .attr('stroke-dasharray', '5 3')
    .attr('opacity','0.4')

mainG.append('g').selectAll().data([avgD]).join('line')
    .attr('y1', height)
    .attr('y2', 0)
    .attr('x1', d=>xScale(d))
    .attr('x2', d=>xScale(d))
    .attr('stroke', 'grey')
    .attr('stroke-width', '1px')
    .attr('stroke-dasharray', '5 3')
    .attr('opacity','0.4')

    

//even line
mainG.append('g').append('line')
.attr('x1', 0)
.attr('x2', width)
.attr('y1', d=>yScale(122))
.attr('y2', d=>yScale(100))
.attr('stroke', 'grey')
.attr('stroke-width', '1px')
.attr('stroke-dasharray', '5 3')
.attr('opacity','0.6')



    

    mainG.append('g').selectAll('.nba-image').data(data).join('svg:image')
                                            .attr('class', 'nba-image')
                                            .attr("xlink:href", d=>`images/nba_logos/${d.team}.svg`)
                                            .attr("x", d=> xScale(d.def_eff)- imageWidth/2)
                                            .attr("y", d=> yScale(d.off_eff) - imageWidth/2)
                                            .attr("width", imageWidth)
                                            .attr("height", imageWidth);

                                                            
    //histgram

    mainG.append("g")
            .attr("fill", "grey")
            .attr('opacity', '0.25')
            .selectAll()
            .data(defBin)
            .join("rect")
            .attr("x", (d) => xdefBinScale(d.x1) + 1)
            .attr("width", (d) => xdefBinScale(d.x0)  - xdefBinScale(d.x1) - 1)
            .attr("y", (d) => ydefBinScale(d.length))
            .attr("height", (d) => ydefBinScale(0) - ydefBinScale(d.length));

        mainG.append("g")
            .attr("fill", "grey")
            .attr('opacity', '0.25')
            .selectAll()
            .data(offBin)
            .join("rect")
            .attr("x", (d) => 0)
            .attr("width", (d) =>xscaleOff(d.length) )
            .attr("y", (d) => yScale(d.x1)+ 1)
            .attr("height", (d) => yScale(d.x0)- yScale(d.x1)-1);



        mainG.append('g').style('font-size','12px').style('opacity', '.85').selectAll().data(["Bad","Good"]).join('text')
                                     .attr('x', (d,i)=>[100,width-100][i])
                                     .attr('y', (d,i)=>[height - 100,100][i])
                                     .attr('fill', 'grey')
                                     .text(d=>d)
                                     
        

    mainG.append('g').style('font-size','12px').style('opacity', '.55').selectAll().data(["Avg Def Efficiency"]).join('text')
                                     .attr('x', 0)
                                     .attr('y', -width/2)
                                     .attr('fill', 'grey')
                                     .attr('text-anchor', 'start')
                                     .attr('transform', 'rotate(90)')
                                     .text(d=>d)

    mainG.append('g').style('font-size','12px').style('opacity', '.55').selectAll().data(["Avg Off Efficiency"]).join('text')
                                     .attr('x', width)
                                     .attr('y', height/2-4)
                                     .attr('fill', 'grey')
                                     .attr('text-anchor', 'end')
                                     .text(d=>d)

    mainG.append('g').style('font-size','12px').style('opacity', '.55').selectAll().data(["Net Rating Zero"]).join('text')
                                     .attr('x', height + 350)
                                     .attr('y', - 1)
                                     .attr('fill', 'grey')
                                     .attr('text-anchor', 'end')
                                     .attr('transform', 'rotate(45)')
                                     .text(d=>d)


   //annotations
   const okcData = data.filter(d=>d.team=== 'Oklahoma_City');
   console.log(okcData,data)
   mainG.append('g').style('font-size','14px').selectAll().data(['#1 defense', "-4.4pts best 2nd","Best D in 5 Years"])
                                               .join('text') 
                                               .attr('fill', "#007AC1")
                                               .attr('x', xScale(okcData[0].def_eff)-40.6)
                                               .attr('y', yScale(okcData[0].off_eff) - 10)
                                                .attr('text-anchor', 'end')
                                               .text(d=>d)
                                               .each(function(p,i){
                                                d3.select(this).attr('transform', `translate(0,${i * 16})`)
                                               })
    const nycData = data.filter(d=>d.team=== 'New_York');
    mainG.append('g').style('font-size','14px').selectAll().data(['Great Offense', "Bad Defense Dou"])
                                               .join('text') 
                                               .attr('fill', "#F58426")
                                               .attr('x', xScale(nycData[0].def_eff)-40.6)
                                               .attr('y', yScale(nycData[0].off_eff) - 10)
                                                .attr('text-anchor', 'end')
                                               .text(d=>d)
                                               .each(function(p,i){
                                                d3.select(this).attr('transform', `translate(0,${i * 16})`)
                                               })

    const washingtonData = data.filter(d=>d.team=== 'Washington');                                           
    mainG.append('g').style('font-size','14px').selectAll().data(['30th in Defense', "30th in Offense", "Bad Combo"])
                                               .join('text') 
                                               .attr('fill', "#002B5C")
                                               .attr('x', xScale(washingtonData[0].def_eff))
                                               .attr('y', yScale(washingtonData[0].off_eff) -65 )
                                                .attr('text-anchor', 'middle')
                                               .text(d=>d)
                                               .each(function(p,i){
                                                d3.select(this).attr('transform', `translate(0,${i * 16})`)
                                               })

const clevelandData = data.filter(d=>d.team=== 'Cleveland');                                           
mainG.append('g').style('font-size','14px').selectAll().data(['1st in Offense', "2.2pts best 2nd"])
                                            .join('text') 
                                            .attr('fill', "#860038")
                                            .attr('x', xScale(clevelandData[0].def_eff)+35)
                                            .attr('y', yScale(clevelandData[0].off_eff)- 8)
                                            .attr('text-anchor', 'start')
                                            .text(d=>d)
                                            .each(function(p,i){
                                            d3.select(this).attr('transform', `translate(0,${i * 16})`)
                                            })


const phoenixData = data.filter(d=>d.team=== 'Phoenix');                                           
mainG.append('g').style('font-size','14px').selectAll().data(["Group of Mid"])
                                            .join('text') 
                                            .attr('fill', "black")
                                            .attr('opacity', '0.85')
                                            .attr('x', xScale(phoenixData[0].def_eff)+30)
                                            .attr('y', yScale(phoenixData[0].off_eff)+40)
                                            .attr('text-anchor', 'start')
                                            .text(d=>d)
                                            .each(function(p,i){
                                            d3.select(this).attr('transform', `translate(0,${i * 16})`)
                                            })

const clippersData = data.filter(d=>d.team=== 'LA_Clippers');                                           
mainG.append('g').style('font-size','14px').selectAll().data(["Winning with D"])
                                            .join('text') 
                                            .attr('fill', "#1d428a")
                                            .attr('opacity', '0.85')
                                            .attr('x', xScale(clippersData[0].def_eff)+ 40)
                                            .attr('y', yScale(clippersData[0].off_eff))
                                            .attr('text-anchor', 'start')
                                            .text(d=>d)
                                            .each(function(p,i){
                                            d3.select(this).attr('transform', `translate(0,${i * 16})`)
                                            })
mainG.append('g').style('font-size','12px').selectAll().data(["Offensive Efficiency Per 100 Possesions"])
                                            .join('text') 
                                            .attr('fill', "DimGrey")
                                            .attr('opacity', '1')
                                            .attr('x', 15)
                                            .attr('y', -2)
                                            .attr('transform', 'rotate(90)')
                                            .attr('text-anchor', 'start')
                                            .text(d=>d)


mainG.append('g').style('font-size','12px').selectAll().data(["Defensive Efficiency Per 100 Possesions"])
                                            .join('text') 
                                            .attr('fill', "DimGrey")
                                            .attr('opacity', '1')
                                            .attr('x', width-15)
                                            .attr('y', height-1)
                                            .attr('text-anchor', 'end')
                                            .text(d=>d)
                                           

            

}