const excel = require("excel4node");
const wb = new excel.Workbook();
const ws = wb.addWorksheet("Report");
const { final_calc } = require("./calc.js");
const libre = require("libreoffice-convert");
const xlsx = require("xlsx");
const handlebars = require("handlebars");
const puppeteer = require("puppeteer");
const fs = require("fs");
libre.convertAsync = require("util").promisify(libre.convert);
// 😊
// Add data to cell A1
async function reportGen(
  values,
  parameter_names,
  farmerInformation,
  local,
  cdtonames,
  remarks,
  yield_targets,
  combination_cd,
  product_cd,
  time_apply_cd,
  crop_season_cd
) {
  time_apply_cd.push({ RECOM_APPLY_TIME_CD: 0, RECOM_APPLY_TIME: "Total" });
  time_apply_cd.sort((a, b) => a.RECOM_APPLY_TIME_CD - b.RECOM_APPLY_TIME_CD);
  function getCombinationName(code) {
    const found = combination_cd.find(
      (item) => item[`COMBINATION_CD`] === parseInt(code)
    );
    return found ? found["COMBINATION_NAME"] : "NOT FOUND";
  }
  function getProductName(code) {
    const found = product_cd.find((item) => item[`PRODUCT_CD`] === code);
    if (found) {
      return found["SW_PRODUCT_NAME"].replace("COMPLEX ", "");
    } else {
      return "NOT FOUND";
    }
  }

  function getSeasonName(code) {
    const found = crop_season_cd.find(
      (item) => item[`CROP_SEASON_CD`] === code
    );
    return found ? found["CROP_SEASON"] : "NOT FOUND";
  }
  function getTimeApply(code) {
    const found = time_apply_cd.find(
      (item) => item[`RECOM_APPLY_TIME_CD`] === code
    );
    return found ? found["RECOM_APPLY_TIME"] : "NOT FOUND";
  }
  // console.log(getCombinationName(12));
  // console.log(getProductName(22));
  // console.log(getSeasonName(1));
  // console.log(getTimeApply(1));
  // console.log(JSON.stringify(final_calc, null, 2));
  const headingText = "K.J. Somaiya Institute of Applied Agricultural Research";
  const document_width = 121.8;
  const th = {
    font: { bold: true, size: 16 },
    alignment: {
      horizontal: "center",
      vertical: "center",
    },
    border: {
      left: { style: "thin" },
      right: { style: "thin" },
      top: { style: "thin" },
      bottom: { style: "thin" },
    },
  };
  const rmk = {
    font: { bold: false, size: 14 },
    alignment: {
      wrapText: true,
      horizontal: "justify", // Justify horizontally
      vertical: "top", // Justify vertically
    },
    border: {
      left: { style: "thin" },
      right: { style: "thin" },
      top: { style: "thin" },
      bottom: { style: "thin" },
    },
  };

  const th_s = {
    font: { bold: true, size: 14 },
    alignment: {
      horizontal: "center",
      vertical: "center",
    },
    border: {
      left: { style: "thin" },
      right: { style: "thin" },
      top: { style: "thin" },
      bottom: { style: "thin" },
    },
  };
  const heading = {
    font: { bold: true, size: 22 },
    alignment: {
      horizontal: "center",
      vertical: "center",
    },
  };

  const padding = {
    alignment: {
      wrapText: true,
      horizontal: "center",
      vertical: "center",
    },
  };

  const h2 = {
    font: { bold: true, size: 14 },
    alignment: {
      horizontal: "center",
      vertical: "center",
    },
    border: {
      left: { style: "thin" },
      right: { style: "thin" },
      top: { style: "thin" },
      bottom: { style: "thin" },
    },
  };
  const h2_r2 = {
    font: { bold: true, size: 14 },
    alignment: {
      horizontal: "center",
      vertical: "center",
    },
    border: {
      left: { style: "thin" },
      right: { style: "thin" },
      top: { style: "thin" },
      bottom: { style: "thin" },
    },
  };

  const h1 = {
    font: { bold: true, size: 16 },
    alignment: {
      vertical: "center",
    },
  };

  const bottom_border = { border: { bottom: { style: "thick" } } };
  const border_all = { border: { bottom: { style: "thin" } } };
  const text = {
    font: { size: 14 },
    border: {
      left: { style: "thin" },
      right: { style: "thin" },
      top: { style: "thin" },
      bottom: { style: "thin" },
    },
    alignment: {
      vertical: "center",
      horizontal: "center",
    },
  };
  //Page Width
  ws.column(1).setWidth(7.4);
  ws.column(2).setWidth(13.1);
  ws.column(3).setWidth(13.1);

  //Heading
  ws.row(1).setHeight(36);
  ws.cell(1, 1, 1, 12, true).string(headingText).style(heading);

  //Taluka District
  ws.row(2).setHeight(24);
  ws.cell(2, 1, 2, 4, true)
    .string("Taluka: Rabakavi-Banahatti")
    .style(h2_r2)
    .style(bottom_border);
  ws.cell(2, 5, 2, 8, true)
    .string("Sameerwadi-587 316")
    .style(h2_r2)
    .style(bottom_border);
  ws.cell(2, 9, 2, 12, true)
    .string("Dt: Bagalkot")
    .style(h2_r2)
    .style(bottom_border);

  //Row 3
  ws.row(3).setHeight(14);

  //Name Farmer ID
  for (let row = 4; row <= 90; row++) {
    if (row === 12) {
      continue;
    } else {
      ws.row(row).setHeight(24);
    }
  }
  ws.cell(4, 1, 4, 2, true).string("Farmer Name").style(h2);
  ws.cell(4, 3, 4, 5, true).string(farmerInformation.name).style(text);
  ws.cell(4, 6, 4, 8, true).string("Cultivator Code").style(h2);
  ws.cell(4, 9, 4, 12, true)
    .number(parseInt(values.values.farmerId))
    .style(text);

  //Cluster/village
  ws.cell(5, 1, 5, 2, true).string("Cluster/Village").style(h2);
  ws.cell(5, 3, 5, 12, true)
    .string(
      cdtonames.clusterName[0].CLUSTER_NAME +
        "/" +
        cdtonames.villageName[0].VILLAGE_NAME
    )
    .style(text);

  //Sy Plot  Area
  ws.cell(6, 1, 6, 2, true).string("Survey No.").style(h2);
  ws.cell(6, 3).string(values.values.surveyNo).style(text);
  ws.cell(6, 4, 6, 5, true).string("Plot no.").style(h2);
  ws.cell(6, 6).number(values.values.plotNo).style(text);
  ws.cell(6, 7, 6, 8, true).string("Area").style(h2);
  ws.cell(6, 9, 6, 12, true).number(local.plotArea).style(text);

  //Soil and Next crop
  ws.cell(7, 1, 7, 2, true).string("Soil Type").style(h2);
  ws.cell(7, 3, 7, 5, true)
    .string(cdtonames.soilName[0].SOIL_TYPE_NAME)
    .style(text);
  ws.cell(7, 6, 7, 8, true).string("Next Crop").style(h2);
  ws.cell(7, 9, 7, 12, true).string(values.values.cropToBeGrown).style(text);

  // Iirgation and dt of sam
  ws.cell(8, 1, 8, 2, true).string("Irrigation Source").style(h2);
  ws.cell(8, 3, 8, 5, true)
    .string(cdtonames.irrigationName[0].IRRIGATION_NAME)
    .style(text);
  ws.cell(8, 6, 8, 8, true).string("Date Of Sampling").style(h2);
  ws.cell(8, 9, 8, 12, true).string(values.values.dtOfSampling).style(text);

  //labNo and date of report
  ws.cell(9, 1, 9, 2, true).string("Lab No.").style(h2);
  ws.cell(9, 3, 9, 5, true).number(values.values.labNo).style(text);
  ws.cell(9, 6, 9, 8, true).string("Date Of Report").style(h2);
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(today.getDate()).padStart(2, "0");
  const dateString = `${year}-${month}-${day}`;
  ws.cell(9, 9, 9, 12, true).string(dateString).style(text);

  // Soil Test Results
  ws.row(10).setHeight(30);
  ws.cell(10, 1, 10, 12, true)
    .string("Soil Test Result")
    .style(th)
    .style(border_all);

  //row 11
  // SL No.1
  ws.cell(11, 1).string("Sr No.").style(h2);
  // Parameter 3
  ws.cell(11, 2, 11, 6, true).string("Parameter Name").style(h2);
  // test Result 2
  ws.cell(11, 7, 11, 8, true).string("Test Value").style(h2);
  //low 1
  ws.cell(11, 9).string("Low").style(h2);
  //med 2
  ws.cell(11, 10, 11, 10, true).string("Medium").style(h2);
  //high 1
  ws.cell(11, 12).string("High").style(h2);

  let i = 12;
  let j = 1;
  //parameter Values Table
  parameter_names.forEach((e) => {
    if (e.PARAMETER_TYPE === "HEADING") {
      ws.row(i).setHeight(30);
      ws.cell(i, 1, i, 12, true)
        .string(e.PARAMETER_NAME)
        .style(th)
        .style(border_all);
      i++;
    } else {
      ws.cell(i, 1).number(j).style(h2);
      ws.cell(i, 2, i, 6, true).string(e.PARAMETER_NAME.substring(2)).style(h2);

      const paramId = e.PARAMETER_ID;
      const paramId_s = paramId.toString();
      const paramValue = values.paramValues[paramId_s];

      if (paramValue !== undefined) {
        ws.cell(i, 7, i, 8, true).number(paramValue).style(h2);
      } else {
        ws.cell(i, 7, i, 8, true).string("N/A").style(h2); // Placeholder value for undefined
      }
      ws.cell(i, 9).string(e.PARAMETER_MIN).style(h2);
      ws.cell(i, 10, i, 11, true).string(e.PARAMETER_MID).style(h2);
      ws.cell(i, 12).string(e.PARAMETER_MAX).style(h2);
      i++;
      j++;
    }
  });
  let sr = 1;
  //Recommendations
  ws.row(i).setHeight(30);
  ws.cell(i, 1, i, 12, true)
    .string("Recommendations")
    .style(th)
    .style(border_all);
  i++;
  ws.row(i).setHeight(30);
  ws.cell(i, 1, i, 12, true)
    .string("Soil Reclamation")
    .style(th_s)
    .style(border_all);
  i++;
  ws.cell(i, 1).number(sr).style(h2);
  ws.cell(i, 2, i, 4, true).string("Gypsum(tonne/acre)").style(text);
  ws.cell(i, 5, i, 6, true).number(0.0).style(text);
  ws.cell(i, 7).string("-").style(h2);
  ws.cell(i, 8, i, 9, true).string("-").style(h2);
  ws.cell(i, 12).string("-").style(h2);
  i++;
  ws.cell(i, 1, i, 12, true).string("OR").style(th_s).style(border_all);
  i++;
  sr++;
  ws.cell(i, 1).number(sr).style(h2);
  ws.cell(i, 2, i, 4, true).string("Sulphur(tonne/acre)").style(text);
  ws.cell(i, 5, i, 6, true).number(0.0).style(text);
  ws.cell(i, 7).string("-").style(h2);
  ws.cell(i, 8, i, 9, true).string("-").style(h2);
  ws.cell(i, 12).string("-").style(h2);
  i++;
  sr = 1;
  ws.cell(i, 1).string("Sr.No").style(h2);
  ws.cell(i, 2, i, 7, true).string("Biofertilizers").style(h2);
  ws.cell(i, 8, i, 12, true).string("Quantity").style(h2);
  i++;
  ws.cell(i, 1).number(sr).style(h2);
  ws.cell(i, 2, i, 7, true)
    .string("Azospirillum (N-Fixer) (kg/acre)")
    .style(text);
  ws.cell(i, 8, i, 12, true).number(4).style(text);
  i++;
  sr++;
  ws.cell(i, 1).number(sr).style(h2);
  ws.cell(i, 2, i, 7, true)
    .string("Bacilus Megatarium (P-Solubilizer) (kg/acre)")
    .style(text);
  ws.cell(i, 8, i, 12, true).number(4.0).style(text);
  i++;
  sr = 1;
  ws.cell(i, 1, i, 12, true)
    .string("Organic Manures")
    .style(th)
    .style(border_all);
  i++;
  ws.cell(i, 1).string("Sr.no").style(h2);
  ws.cell(i, 2, i, 7, true).string("Manure").style(h2);
  ws.cell(i, 8, i, 12, true).string("Quantity").style(h2);

  i++;
  ws.cell(i, 1).number(sr).style(h2);
  ws.cell(i, 2, i, 7, true)
    .string("Farm Yard Manure (FYM) (tonne/acre)")
    .style(text);
  ws.cell(i, 8, i, 12, true).number(12).style(text);
  i++;
  sr++;

  ws.cell(i, 1, i, 12, true).string("OR").style(th_s).style(border_all);
  i++;
  ws.cell(i, 1).number(sr).style(h2);
  ws.cell(i, 2, i, 7, true).string("Bhumilabh (tonne/acre)").style(text);
  ws.cell(i, 8, i, 12, true).number(2).style(text);
  i++;
  ws.row(i).setHeight(60);
  ws.cell(i, 1, i, 12, true).string(remarks).style(rmk).style(border_all);
  i++;
  //Soil recommendations
  ws.cell(i, 1, i, 12, true)
    .string("Soil Test Based Nutrient Recommendations")
    .style(th)
    .style(border_all);
  i++;
  ws.cell(i, 1, i, 3, true).string("Sugarcane Season").style(th);
  ws.cell(i, 4, i, 6, true).string("Adsali").style(th);
  ws.cell(i, 7, i, 9, true).string("Pre-seasonal").style(th);
  ws.cell(i, 10, i, 12, true).string("Seasonal").style(th);
  i++;
  ws.row(i).setHeight(30);
  ws.cell(i, 1, i, 3, true)
    .string("Sugarcane Yield Target(tonne/acre)")
    .style(th);
  ws.cell(i, 4, i, 6, true).number(yield_targets[0].TARGET_YIELD).style(th);
  ws.cell(i, 7, i, 9, true).number(yield_targets[1].TARGET_YIELD).style(th);
  ws.cell(i, 10, i, 12, true).number(yield_targets[2].TARGET_YIELD).style(th);
  i++;
  ws.cell(i, 1, i, 12, true)
    .string("Nutrients (kg/acre)")
    .style(th_s)
    .style(border_all);
  i++;
  sr = 1;

  //calculations parsing in the excel
  //nutrients[level][code]["1"];
  const nutrients = final_calc[12];
  let npk = [27, 28, 29];
  npk.forEach((code) => {
    const valuesForCode = {};
    ws.cell(i, 1, i, 3, true).string(getProductName(code)).style(h2);
    let x = 0;
    Object.keys(nutrients).forEach((level) => {
      ws.cell(i, 4 + x, i, 6 + x, true)
        .number(nutrients[level][code]["1"])
        .style(text);
      x = x + 3;
    });
    i++;
    // console.log(`Values for code ${code}:`, valuesForCode);
  });
  ws.cell(i, 1, i, 12, true)
    .string("Recommended dose of straight and complext fertilizers (kg/acre)")
    .style(th_s)
    .style(border_all);
  i++;
  ws.cell(i, 1, i, 3, true).string("Sugarcane Season").style(h2);
  ws.cell(i, 4, i, 6, true).string("Adsali").style(h2);
  ws.cell(i, 7, i, 9, true).string("Pre-seasonal").style(h2);
  ws.cell(i, 10, i, 12, true).string("Seasonal").style(h2);
  i++;
  //calculations the main beast
  delete final_calc[12];
  const order = [
    { 103: [23, 32, 20] },
    { 104: [25, 32, 20] },
    { 105: [24, 32, 20] },
    { 106: [22, 32, 20] },
  ];
  const season_keys = [1, 2, 3];

  const comb_values = () => {
    try {
      const comb_cd = Object.keys(final_calc);
      let row = 0;
      let col = 1;
      comb_cd.map((comb) => {
        for (let u = 0; u < 2; u++) {
          if (col < 4) {
            time_apply_cd.map((e) => {
              ws.cell(i + row, col, i + row, col + 2, true)
                .string(e.RECOM_APPLY_TIME)
                .style(h2);
              row++;
            });
            col = 4;
            row = 0;
          } else if (col < 13) {
            const season_cd = Object.keys(final_calc[comb]);
            season_cd.map((season) => {
              const product_cd = Object.keys(final_calc[comb][season]);
              product_cd.map((product) => {
                const ta_cd = Object.keys(final_calc[comb][season][product]);
                ta_cd.map((value) => {
                  ws.cell(i + row, col)
                    .number(parseInt(final_calc[comb][season][product][value]))
                    .style(text);
                  row++;
                });
                col++;
                row = 0;
              });
            });
            row = 0;
            col = 1;
            i = i + 8;
          }
        }
      });
    } catch (e) {
      console.log(e);
    }
  };

  const comb_heading = () => {
    try {
      const comb_cd = Object.keys(final_calc);
      let row = 0;
      let col = 4;
      comb_cd.map((comb) => {
        for (let t = 0; t < 2; t++) {
          if (row === 0) {
            ws.cell(i, 1, i, 3, true)
              .string(getCombinationName(comb))
              .style(h2);
            row = (row + 1) % 8;
          } else if (col < 13) {
            ws.cell(i + row, 1, i + row, 3, true)
              .string("Time of Application")
              .style(h2);
            const season_cd = Object.keys(final_calc[comb]);
            season_cd.map((season) => {
              const product_cd = Object.keys(final_calc[comb][season]);
              product_cd.map((product) => {
                ws.cell(i + row, col)
                  .string(getProductName(parseInt(product)))
                  .style(h2);
                col++;
              });
            });
          }
        }
        i = i + 8;
        row = 0;
        col = 4;
      });
    } catch (e) {
      console.log(e);
    }
  };

  let temp_i = i;
  comb_heading();
  i = temp_i + 2;
  comb_values();
  i = i - 2;
  ws.cell(i, 1, i, 12, true).string("Micronutrients").style(th);
  i++;
  ws.cell(i, 1, i, 2, true).string("Sr No.").style(h2);
  ws.cell(i, 3, i, 9, true).string("Fertilizer").style(h2);
  ws.cell(i, 10, i, 12, true).string("Quantitiy(kg/acre)").style(h2);
  i++;
  sr = 1;

  const micronutrients = (key) => !npk.includes(parseInt(key));
  Object.keys(nutrients[1]).forEach((key) => {
    if (micronutrients(key)) {
      const values = nutrients[1][key];
      ws.cell(i, 1, i, 2, true).number(sr).style(h2);
      ws.cell(i, 3, i, 9, true)
        .string(getProductName(parseInt(key)))
        .style(h2);
      ws.cell(i, 10, i, 12, true).number(values[1]).style(h2);
      i++;
      sr++;
    }
  });
  let srNo = 1;
  const comb_cd = Object.keys(final_calc);
  const parameterData = parameter_names.map((e) => {
    if (e.PARAMETER_TYPE === "HEADING") {
      return {
        PARAMETER_NAME: e.PARAMETER_NAME,
        PARAMETER_TYPE: "HEADING",
      };
    } else {
      const paramId = e.PARAMETER_ID.toString();
      const paramValue =
        values.paramValues[paramId] !== undefined
          ? values.paramValues[paramId]
          : "N/A";
      const data = {
        PARAMETER_NAME: e.PARAMETER_NAME.substring(2),
        PARAMETER_MIN: e.PARAMETER_MIN,
        PARAMETER_MID: e.PARAMETER_MID,
        PARAMETER_MAX: e.PARAMETER_MAX,
        PARAMETER_VALUE: paramValue,
      };
      data.srNo = srNo++; // Assign Sr No. and increment
      return data;
    }
  });

  npk = [27, 28, 29];
  let npkdata = [];
  npk.forEach((code) => {
    let valuesForCode = {};
    Object.keys(nutrients).forEach((level) => {
      valuesForCode[level] = nutrients[level][code]["1"];
    });
    npkdata.push({
      npkName: getProductName(code),
      npkvalues: valuesForCode,
    });
  });

  // const generateTableHeader = (comb_cd) => {
  //   let entire_name = `<div class='grid-item'><div class='item'>${getCombinationName(
  //     comb_cd
  //   )}</div></div><div class='grid-item'><div class='item'>Time Of Application</div>`;
  //   const season_cd = Object.keys(final_calc[comb_cd]);
  //   season_cd.forEach((season) => {
  //     const prod_cd = Object.keys(final_calc[comb_cd][season]);
  //     prod_cd.forEach((product) => {
  //       entire_name += `<div class='item'>${getProductName(
  //         parseInt(product)
  //       )}</div>`;
  //     });
  //   });
  //   entire_name += `</div>`;
  //   return new handlebars.SafeString(entire_name);
  // };

  // const generateTableBody = (comb_cd) => {
  //   let bodyStart = ``;
  //   let time_apply_cd = [];
  //   const season_cd = Object.keys(final_calc[comb_cd]);
  //   season_cd.forEach((season) => {
  //     const prod_cd = Object.keys(final_calc[comb_cd][season]);
  //     prod_cd.forEach((product) => {
  //       time_apply_cd = Object.keys(final_calc[comb_cd][season][product]);
  //     });
  //   });
  //   time_apply_cd.forEach((ta) => {
  //     bodyStart += `<div class='grid-item'><div class='item'>${getTimeApply(
  //       parseInt(ta)
  //     )}</div>`;
  //     season_cd.forEach((season) => {
  //       const prod_cd = Object.keys(final_calc[comb_cd][season]);
  //       prod_cd.forEach((product) => {
  //         bodyStart += `<div class='item'>${final_calc[comb_cd][season][product][ta]}</div>`;
  //       });
  //     });
  //     bodyStart += `</div>`;
  //   });
  //   return new handlebars.SafeString(bodyStart);
  // };
  const generateTableHeader = (comb_cd) => {
    let entire_name = `<tr><th>${getCombinationName(
      comb_cd
    )}</th></tr><tr><th>Time Of Application</th>`;
    const season_cd = Object.keys(final_calc[comb_cd]);
    season_cd.forEach((season) => {
      const prod_cd = Object.keys(final_calc[comb_cd][season]);
      prod_cd.forEach((product) => {
        entire_name += `<th>${getProductName(parseInt(product))}</th>`;
      });
    });
    entire_name += `</tr>`;
    return new handlebars.SafeString(entire_name);
  };

  const generateTableBody = (comb_cd) => {
    let bodyStart = ``;
    let time_apply_cd = [];
    const season_cd = Object.keys(final_calc[comb_cd]);
    season_cd.forEach((season) => {
      const prod_cd = Object.keys(final_calc[comb_cd][season]);
      prod_cd.forEach((product) => {
        time_apply_cd = Object.keys(final_calc[comb_cd][season][product]);
      });
    });
    time_apply_cd.forEach((ta) => {
      bodyStart += `<tr><td>${getTimeApply(parseInt(ta))}</td>`;
      season_cd.forEach((season) => {
        const prod_cd = Object.keys(final_calc[comb_cd][season]);
        prod_cd.forEach((product) => {
          bodyStart += `<td>${final_calc[comb_cd][season][product][ta]}</td>`;
        });
      });
      bodyStart += `</tr>`;
    });
    return new handlebars.SafeString(bodyStart);
  };

  sr = 1;
  const micro_data_func = () => {
    let data = [];
    Object.keys(nutrients[1]).forEach((key) => {
      if (micronutrients(key)) {
        const value = nutrients[1][key][1];
        const micro_name = getProductName(parseInt(key));
        const obj = {
          micro_value: value,
          micro_name: micro_name,
        };
        obj.srNo = sr++;
        data.push(obj);
      }
    });
    return data;
  };

  const micro_data = micro_data_func();
  const data = {
    parameterData: parameterData,
    remarksPara: remarks,
    npkdata: npkdata,
    yield_targets: yield_targets,
    comb_iter: comb_cd,
    micro_data: micro_data,
    values: values,
    farmerInformation: farmerInformation,
    local: local,
    cdtonames: cdtonames,
  };
  handlebars.registerHelper("parseInt", function (value) {
    // Use parseInt function to parse the value
    return parseInt(value);
  });
  handlebars.registerHelper("generateTableBody", generateTableBody);
  handlebars.registerHelper("generateTableHeader", generateTableHeader);
  handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
    return arg1 == arg2 ? options.fn(this) : options.inverse(this);
  });

  const templateHtml = fs.readFileSync("template.html", "utf8");
  const template = handlebars.compile(templateHtml);
  const html = template(data);

  const generatePDF = async (html) => {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(html);
      const pdfBuffer = await page.pdf({ format: "A3" });
      fs.writeFileSync("output.pdf", pdfBuffer);
      console.log("PDF generated successfully!");
      await browser.close();
      return pdfBuffer;
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  final_calc[12] = nutrients;
  // const buffer = await wb.writeToBuffer(html);
  const pdfbuffer = await generatePDF(html);
  wb.write("output.xlsx", (err, stats) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Excel file created successfully!");

      return true;
    }
  });
  return pdfbuffer;
}

module.exports = { reportGen };
