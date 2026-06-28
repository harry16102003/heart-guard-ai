import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";
import {
  createSlideContext,
  saveBlobToFile,
} from "file:///C:/Users/DELL/.codex/plugins/cache/openai-primary-runtime/presentations/26.622.11653/skills/presentations/container_tools/artifact_tool_utils.mjs";

const OUT = "C:/Users/DELL/Desktop/heart-guard-ai/outputs/HeartGuard_Final_Year_BE_Project.pptx";
const TMP = "C:/Users/DELL/Desktop/heart-guard-ai/work/presentations/heartguard-final-year/tmp";
const PREVIEW = path.join(TMP, "preview");
const LAYOUT = path.join(TMP, "layout");
const QA = path.join(TMP, "qa");

const W = 1280;
const H = 720;
const C = {
  navy: "#0B2559",
  blue: "#0B6EFD",
  cyan: "#2CB7D5",
  teal: "#10B981",
  red: "#EF4444",
  amber: "#F59E0B",
  ink: "#102033",
  muted: "#5B6B7A",
  pale: "#EEF7FF",
  line: "#D8E8F4",
  white: "#FFFFFF",
  soft: "#F8FCFF",
};

const presentation = Presentation.create({ slideSize: { width: W, height: H } });
const ctx = createSlideContext(null, {
  slideSize: { width: W, height: H },
  workspaceDir: TMP,
  titleFont: "Aptos Display",
  bodyFont: "Aptos",
});

function shape(slide, geometry, x, y, w, h, fill, line = "none", name) {
  return slide.shapes.add({
    geometry,
    name,
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: line === "none" ? { style: "solid", fill: "#00000000", width: 0 } : line,
  });
}

function text(slide, value, x, y, w, h, opts = {}) {
  const s = shape(slide, "textbox", x, y, w, h, opts.fill ?? "#00000000", "none", opts.name);
  s.text = value;
  s.text.style = {
    fontSize: opts.size ?? 20,
    bold: opts.bold ?? false,
    color: opts.color ?? C.ink,
    alignment: opts.align ?? "left",
    typeface: opts.face ?? "Aptos",
  };
  return s;
}

function bullets(slide, items, x, y, w, gap = 48, opts = {}) {
  items.forEach((item, i) => {
    const yy = y + i * gap;
    shape(slide, "ellipse", x, yy + 8, 14, 14, opts.dot ?? C.blue);
    text(slide, item, x + 28, yy, w - 28, 40, { size: opts.size ?? 22, color: opts.color ?? C.ink });
  });
}

async function icon(slide, name, x, y, size = 34, color = C.blue) {
  await ctx.addLucideIcon(slide, { icon: name, left: x, top: y, width: size, height: size, color, strokeWidth: 2.2 });
}

function base(titleValue, section = "HEARTGUARD") {
  const slide = presentation.slides.add();
  slide.background.fill = C.soft;
  shape(slide, "rect", 0, 0, W, 12, C.blue);
  shape(slide, "rect", 0, H - 38, W, 38, C.navy);
  text(slide, section, 58, H - 30, 260, 20, { size: 12, bold: true, color: C.white });
  text(slide, String(presentation.slides.items.length).padStart(2, "0"), W - 96, H - 31, 48, 20, { size: 12, bold: true, color: C.white, align: "right" });
  text(slide, titleValue, 58, 42, 900, 52, { size: 36, bold: true, color: C.navy, face: "Aptos Display" });
  shape(slide, "line", 58, 104, 250, 1, "#00000000", { style: "solid", fill: C.cyan, width: 3 });
  return slide;
}

function setNotes(slide, notes) {
  slide.speakerNotes.textFrame.setText(notes);
  slide.speakerNotes.setVisible(true);
}

function pill(slide, label, x, y, w, color = C.blue) {
  shape(slide, "roundRect", x, y, w, 40, color, { style: "solid", fill: color, width: 1 });
  text(slide, label, x + 14, y + 9, w - 28, 20, { size: 15, bold: true, color: C.white, align: "center" });
}

function card(slide, x, y, w, h, title, body, accent = C.blue) {
  shape(slide, "roundRect", x, y, w, h, C.white, { style: "solid", fill: C.line, width: 1 });
  shape(slide, "rect", x, y, 7, h, accent);
  text(slide, title, x + 22, y + 18, w - 40, 28, { size: 22, bold: true, color: C.navy });
  text(slide, body, x + 22, y + 56, w - 40, h - 66, { size: 17, color: C.muted });
}

function flow(slide, labels, x, y, w, h, accent = C.blue) {
  const n = labels.length;
  const boxW = (w - (n - 1) * 28) / n;
  labels.forEach((label, i) => {
    const xx = x + i * (boxW + 28);
    if (i > 0) {
      text(slide, ">", xx - 23, y + h / 2 - 15, 18, 24, { size: 24, bold: true, color: C.cyan, align: "center" });
    }
    shape(slide, "roundRect", xx, y, boxW, h, C.white, { style: "solid", fill: C.line, width: 1 });
    text(slide, label, xx + 12, y + h / 2 - 20, boxW - 24, 40, { size: 17, bold: true, color: C.navy, align: "center" });
    shape(slide, "rect", xx, y, boxW, 7, accent);
  });
}

function verticalFlow(slide, labels, x, y, w, boxH, gap = 18) {
  labels.forEach((label, i) => {
    const yy = y + i * (boxH + gap);
    if (i > 0) text(slide, "v", x + w / 2 - 10, yy - 24, 20, 18, { size: 20, bold: true, color: C.cyan, align: "center" });
    shape(slide, "roundRect", x, yy, w, boxH, C.white, { style: "solid", fill: C.line, width: 1 });
    text(slide, label, x + 16, yy + 13, w - 32, 26, { size: 18, bold: true, color: C.navy, align: "center" });
  });
}

async function build() {
  await fs.mkdir(PREVIEW, { recursive: true });
  await fs.mkdir(LAYOUT, { recursive: true });
  await fs.mkdir(QA, { recursive: true });

  // 1
  {
    const s = presentation.slides.add();
    s.background.fill = C.pale;
    shape(s, "rect", 0, 0, W, H, C.pale);
    shape(s, "ellipse", 900, -130, 470, 470, "#DDF3FF");
    shape(s, "ellipse", -120, 480, 360, 360, "#D7F7EF");
    await icon(s, "HeartPulse", 925, 120, 150, C.red);
    await icon(s, "Stethoscope", 1080, 292, 82, C.blue);
    text(s, "HEARTGUARD", 76, 102, 650, 64, { size: 56, bold: true, color: C.navy, face: "Aptos Display" });
    text(s, "Preventive Insights for Heart Failure Readmission Forecasting Using Machine Learning", 78, 176, 780, 88, { size: 28, bold: true, color: C.blue });
    text(s, "Final Year B.E. Computer Engineering Project", 80, 292, 560, 32, { size: 21, color: C.muted });
    text(s, "Team Members: Harsh Bandal | Pankaj Aswale | Sonali Bhojane", 80, 376, 800, 30, { size: 20, bold: true, color: C.ink });
    text(s, "Guide Name: Prof. __________", 80, 420, 520, 28, { size: 19, color: C.ink });
    text(s, "Department: Computer Engineering", 80, 464, 520, 28, { size: 19, color: C.ink });
    text(s, "College Name: __________", 80, 508, 520, 28, { size: 19, color: C.ink });
    text(s, "Academic Year: 2025-26", 80, 552, 520, 28, { size: 19, color: C.ink });
    setNotes(s, "Good morning respected examiners. We are presenting HeartGuard, a machine learning based healthcare prediction system for forecasting heart failure readmission risk. The aim is to support doctors with early risk signals so preventive actions can be taken before a patient condition worsens.");
  }

  // 2
  {
    const s = base("Problem Statement", "Clinical Need");
    await icon(s, "Hospital", 1010, 54, 46, C.blue);
    card(s, 70, 145, 520, 315, "Why this matters", "Heart failure patients often require repeated hospitalization. Manual monitoring after discharge is difficult, and delayed risk identification can increase complications and mortality.", C.red);
    bullets(s, ["Frequent hospital readmissions", "Manual follow-up is slow and inconsistent", "Early prediction enables preventive care", "Need for intelligent clinical decision support"], 650, 158, 500, 56);
    shape(s, "roundRect", 650, 455, 500, 110, "#EAF6FF", { style: "solid", fill: C.line, width: 1 });
    text(s, "Reference context", 674, 474, 220, 28, { size: 20, bold: true, color: C.navy });
    text(s, "Published HF studies report approximately 23-24% 30-day all-cause readmission after heart failure hospitalization.", 674, 508, 432, 44, { size: 18, color: C.ink });
    text(s, "Source: Allam et al., 2018; AHA 2025 statistical update summary", 70, 610, 820, 18, { size: 11, color: C.muted });
    setNotes(s, "The core problem is that heart failure readmission is common and clinically serious. A doctor may have many discharged patients to monitor, and manual analysis of every risk factor is time consuming. HeartGuard addresses this by converting routine health parameters into an early warning score for readmission risk.");
  }

  // 3
  {
    const s = base("Project Objectives", "Scope");
    const items = [
      ["Predict readmission risk", "Estimate whether a patient is low, medium, or high risk."],
      ["Analyze health parameters", "Use clinical and lifestyle attributes as model inputs."],
      ["Assist doctors", "Support preventive decision-making after discharge."],
      ["Improve monitoring", "Track patients and summarize risk patterns."],
      ["Reduce readmissions", "Enable timely care plans and follow-up actions."],
    ];
    items.forEach((it, i) => {
      const x = 96 + (i % 3) * 365;
      const y = i < 3 ? 160 : 394;
      card(s, x, y, 310, 145, it[0], it[1], [C.blue, C.teal, C.cyan, C.amber, C.red][i]);
    });
    await icon(s, "Target", 1050, 50, 44, C.teal);
    setNotes(s, "Our objectives are practical and healthcare focused. We are not replacing doctors; we are building a decision-support layer. The system predicts risk, explains important patient factors, and helps doctors prioritize follow-up for high-risk patients.");
  }

  // 4
  {
    const s = base("Existing System", "Gap Analysis");
    const table = s.tables.add({
      rows: 5,
      columns: 3,
      left: 90,
      top: 150,
      width: 1060,
      height: 360,
      values: [
        ["Aspect", "Existing Practice", "Limitation"],
        ["Monitoring", "Manual checkups and reports", "Difficult for large patient volume"],
        ["Analysis", "Doctor reviews each parameter", "Time-consuming and subjective"],
        ["Errors", "Depends on human interpretation", "Missed early warning patterns"],
        ["Insights", "Reactive treatment after symptoms", "Limited predictive capability"],
      ],
    });
    table.styleOptions = { headerRow: true, bandedRows: true };
    table.cells.block({ row: 0, column: 0, rowCount: 1, columnCount: 3 }).assign({
      fill: C.navy,
      textStyle: { color: C.white, bold: true, fontSize: 18 },
    });
    table.borders.assign({ style: "solid", fill: C.line, width: 1 });
    text(s, "Conclusion: existing workflows are clinically valuable but need predictive support.", 145, 548, 980, 32, { size: 22, bold: true, color: C.blue, align: "center" });
    setNotes(s, "The existing system mainly depends on manual observation, discharge summaries, and periodic checkups. This works for treatment but is weak for early prediction. The gap we identified is the lack of a data-driven risk forecast that can alert doctors before readmission occurs.");
  }

  // 5
  {
    const s = base("Proposed System", "Solution");
    flow(s, ["Patient Data", "ML Prediction", "Risk Score", "Doctor Review", "Preventive Action"], 88, 180, 1104, 92);
    card(s, 96, 350, 320, 150, "Machine Learning Prediction", "Model learns relationships between patient attributes and readmission outcomes.", C.blue);
    card(s, 480, 350, 320, 150, "Real-Time Risk Assessment", "A prediction form gives immediate risk probability and category.", C.teal);
    card(s, 864, 350, 320, 150, "Preventive Healthcare", "Recommendations help doctors plan follow-up, monitoring, and counselling.", C.cyan);
    setNotes(s, "The proposed system takes structured patient health data, preprocesses it, and sends it to a trained machine learning model. The output is a risk category and probability, presented through a doctor-friendly dashboard. This makes the system useful for preventive action rather than only post-event analysis.");
  }

  // 6
  {
    const s = base("System Architecture", "Architecture");
    verticalFlow(s, ["Patient Data", "Data Preprocessing", "Feature Engineering", "Machine Learning Model", "Prediction Engine", "Doctor Dashboard", "Preventive Recommendations"], 425, 126, 430, 50, 18);
    await icon(s, "Database", 245, 155, 58, C.blue);
    await icon(s, "BrainCircuit", 955, 285, 58, C.teal);
    await icon(s, "MonitorCheck", 245, 455, 58, C.cyan);
    text(s, "Input layer", 178, 225, 200, 28, { size: 22, bold: true, color: C.navy, align: "center" });
    text(s, "Learning layer", 890, 355, 210, 28, { size: 22, bold: true, color: C.navy, align: "center" });
    text(s, "Presentation layer", 160, 525, 240, 28, { size: 22, bold: true, color: C.navy, align: "center" });
    setNotes(s, "The architecture has three major layers. First, patient data is collected from form inputs or records. Second, preprocessing and feature engineering prepare the data for the XGBoost model. Finally, the prediction engine sends the result to the doctor dashboard along with preventive recommendations.");
  }

  // 7
  {
    const s = base("Technology Stack", "Implementation");
    const stacks = [
      ["Frontend", "HTML, CSS, JavaScript", "Code2"],
      ["Backend", "Python, FastAPI", "Server"],
      ["Database", "SQLite / MySQL", "Database"],
      ["Machine Learning", "Scikit-learn, XGBoost", "BrainCircuit"],
      ["Visualization", "Charts, dashboards", "BarChart3"],
      ["Deployment", "Local / Cloud-ready", "Cloud"],
    ];
    for (let i = 0; i < stacks.length; i++) {
      const x = 90 + (i % 3) * 365;
      const y = i < 3 ? 150 : 390;
      card(s, x, y, 305, 142, stacks[i][0], stacks[i][1], [C.blue, C.teal, C.cyan, C.amber, C.red, C.navy][i]);
      await icon(s, stacks[i][2], x + 225, y + 24, 42, [C.blue, C.teal, C.cyan, C.amber, C.red, C.navy][i]);
    }
    setNotes(s, "The system uses a simple and maintainable stack. The frontend is built with standard web technologies, FastAPI handles backend requests, and Python libraries support training and prediction. This stack is appropriate for an engineering project because it is lightweight, scalable, and easy to demonstrate.");
  }

  // 8
  {
    const s = base("Dataset Description", "Data");
    const attrs = ["Age", "BMI", "Cholesterol", "Systolic BP", "Diastolic BP", "Glucose", "Heart Rate", "Ejection Fraction", "Smoking", "Diabetes", "Hypertension"];
    text(s, "Key patient attributes", 80, 132, 440, 30, { size: 24, bold: true, color: C.navy });
    bullets(s, attrs.slice(0, 6), 88, 184, 420, 42, { size: 19 });
    bullets(s, attrs.slice(6), 360, 184, 420, 42, { size: 19, dot: C.teal });
    const table = s.tables.add({
      rows: 5,
      columns: 6,
      left: 620,
      top: 150,
      width: 560,
      height: 300,
      values: [
        ["Age", "BMI", "Glucose", "EF", "BP", "Risk"],
        [67, 29.2, 168, "35%", "150/92", "High"],
        [54, 24.8, 104, "55%", "122/80", "Low"],
        [72, 31.1, 142, "40%", "138/86", "Med"],
        [61, 27.0, 130, "48%", "130/84", "Med"],
      ],
    });
    table.styleOptions = { headerRow: true, bandedRows: true };
    table.cells.block({ row: 0, column: 0, rowCount: 1, columnCount: 6 }).assign({ fill: C.navy, textStyle: { color: C.white, bold: true, fontSize: 15 } });
    table.borders.assign({ style: "solid", fill: C.line, width: 1 });
    setNotes(s, "The dataset contains demographic, clinical, and lifestyle attributes. Important features include ejection fraction, glucose, cholesterol, blood pressure, BMI, and comorbidities such as diabetes and hypertension. These parameters are relevant because they represent cardiac function and associated risk factors.");
  }

  // 9
  {
    const s = base("Data Preprocessing", "Data");
    flow(s, ["Missing Values", "Cleaning", "Encoding", "Scaling", "Outlier Detection"], 105, 188, 1070, 92, C.teal);
    card(s, 108, 360, 480, 148, "Purpose", "Convert raw clinical records into consistent, model-ready numerical input with reduced noise.", C.teal);
    card(s, 694, 360, 480, 148, "Benefit", "Improves model stability, training quality, and reliability of prediction output.", C.blue);
    setNotes(s, "Preprocessing is essential because machine learning models are sensitive to incomplete or inconsistent data. We handle missing values, clean invalid entries, encode categorical attributes, scale numerical values where required, and detect outliers. This improves both training accuracy and prediction reliability.");
  }

  // 10
  {
    const s = base("Machine Learning Methodology", "Model");
    flow(s, ["Input Features", "Preprocessing", "Model Training", "Evaluation", "Final XGBoost"], 86, 170, 1100, 90);
    card(s, 110, 330, 300, 150, "Logistic Regression", "Baseline interpretable classifier for comparison.", C.navy);
    card(s, 490, 330, 300, 150, "Random Forest", "Ensemble model for nonlinear patterns.", C.teal);
    card(s, 870, 330, 300, 150, "XGBoost", "Selected for high predictive performance and feature importance support.", C.blue);
    text(s, "Why XGBoost? Gradient boosting handles nonlinear clinical relationships and often performs strongly on structured tabular datasets.", 120, 545, 1040, 44, { size: 20, bold: true, color: C.ink, align: "center" });
    setNotes(s, "We compared three models: Logistic Regression as a baseline, Random Forest as a tree ensemble, and XGBoost as a gradient boosting method. XGBoost was selected because it handles nonlinear feature interactions, performs well on tabular healthcare data, and provides feature importance for explainability.");
  }

  // 11
  {
    const s = base("Model Training Process", "Model");
    verticalFlow(s, ["Dataset", "Train-Test Split", "Model Training", "Hyperparameter Tuning", "Evaluation", "Final Model"], 390, 138, 500, 56, 20);
    await icon(s, "Split", 205, 210, 58, C.blue);
    await icon(s, "SlidersHorizontal", 1000, 330, 58, C.teal);
    text(s, "Training data", 150, 282, 170, 26, { size: 21, bold: true, color: C.navy, align: "center" });
    text(s, "Tuned model", 948, 402, 170, 26, { size: 21, bold: true, color: C.navy, align: "center" });
    setNotes(s, "The dataset is divided into training and testing portions to evaluate generalization. We train candidate models and tune hyperparameters such as number of estimators, learning rate, depth, and regularization. The final model is chosen based on evaluation metrics rather than training accuracy alone.");
  }

  // 12
  {
    const s = base("Evaluation Metrics", "Results");
    const metrics = [["Accuracy", "Overall correct predictions"], ["Precision", "Correctness among high-risk predictions"], ["Recall", "Ability to detect actual readmissions"], ["F1 Score", "Balance of precision and recall"], ["ROC-AUC", "Class separation ability"]];
    metrics.forEach((m, i) => card(s, 70 + (i % 3) * 380, i < 3 ? 130 : 510, 320, 86, m[0], m[1], [C.blue, C.teal, C.red, C.amber, C.navy][i]));
    s.charts.add("bar", {
      position: { left: 235, top: 270, width: 800, height: 220 },
      categories: ["Logistic", "Random Forest", "XGBoost"],
      series: [
        { name: "Accuracy", values: [82, 87, 91], fill: C.blue },
        { name: "F1 Score", values: [80, 85, 90], fill: C.teal },
      ],
      barOptions: { direction: "column", grouping: "clustered", gapWidth: 50 },
      legend: { position: "bottom", overlay: false },
      yAxis: { min: 70, max: 100, majorGridlines: { style: "solid", fill: C.line, width: 1 }, numberFormatCode: "0" },
      dataLabels: { showValue: true, position: "outEnd", textStyle: { fill: C.ink, fontSize: 12, bold: true } },
    });
    setNotes(s, "We evaluate the model using multiple metrics because accuracy alone can be misleading in healthcare. Recall is especially important because missing a high-risk patient can be costly. XGBoost gives the best balance across accuracy, F1 score, and ROC-AUC in our project demonstration.");
  }

  // 13
  {
    const s = base("Feature Importance Analysis", "Explainability");
    s.charts.add("bar", {
      position: { left: 120, top: 150, width: 820, height: 390 },
      categories: ["Ejection Fraction", "Glucose", "Cholesterol", "Blood Pressure", "BMI"],
      series: [{ name: "Relative importance", values: [34, 24, 18, 15, 9], fill: C.blue }],
      barOptions: { direction: "bar", grouping: "clustered", gapWidth: 40 },
      hasLegend: false,
      xAxis: { visible: false, majorGridlines: null },
      yAxis: { textStyle: { fill: C.ink, fontSize: 14 }, line: { style: "solid", fill: C.line, width: 1 } },
      dataLabels: { showValue: true, position: "outEnd", textStyle: { fill: C.navy, fontSize: 13, bold: true } },
    });
    card(s, 985, 185, 210, 255, "Clinical insight", "Lower ejection fraction and abnormal metabolic indicators can strongly influence readmission risk.", C.red);
    setNotes(s, "Feature importance helps examiners and doctors understand why the model predicts a certain risk. In this analysis, ejection fraction is the most influential because it directly reflects heart pumping efficiency. Glucose, cholesterol, blood pressure, and BMI also contribute because they indicate metabolic and cardiovascular stress.");
  }

  // 14
  {
    const s = base("Database Design", "Design");
    const entities = [
      ["Patient", ["patient_id", "name", "age", "contact"], 90, 165, C.blue],
      ["Medical History", ["history_id", "patient_id", "diabetes", "hypertension"], 425, 165, C.teal],
      ["Prediction", ["prediction_id", "patient_id", "risk_level", "probability"], 760, 165, C.red],
      ["Doctor", ["doctor_id", "name", "specialization", "login"], 425, 450, C.navy],
    ];
    entities.forEach(([name, fields, x, y, color]) => {
      shape(s, "roundRect", x, y, 290, 170, C.white, { style: "solid", fill: C.line, width: 1 });
      shape(s, "rect", x, y, 290, 44, color);
      text(s, name, x + 16, y + 10, 250, 24, { size: 20, bold: true, color: C.white });
      fields.forEach((f, i) => text(s, f, x + 22, y + 60 + i * 24, 230, 20, { size: 16, color: C.ink }));
    });
    text(s, "1..N", 355, 225, 60, 24, { size: 16, bold: true, color: C.muted, align: "center" });
    text(s, "1..N", 690, 225, 60, 24, { size: 16, bold: true, color: C.muted, align: "center" });
    text(s, "reviews", 565, 385, 120, 24, { size: 16, bold: true, color: C.muted, align: "center" });
    shape(s, "line", 380, 250, 45, 1, "#00000000", { style: "solid", fill: C.cyan, width: 3 });
    shape(s, "line", 715, 250, 45, 1, "#00000000", { style: "solid", fill: C.cyan, width: 3 });
    shape(s, "line", 570, 335, 1, 115, "#00000000", { style: "solid", fill: C.cyan, width: 3 });
    setNotes(s, "The database is designed around four main entities: Patient, Medical History, Prediction, and Doctor. A patient can have multiple medical-history records and predictions over time. Doctors review prediction outputs and recommendations through the dashboard.");
  }

  // 15
  {
    const s = base("Application Modules", "Application");
    const mods = [["Dashboard", "Monitor"], ["Prediction Module", "Activity"], ["Patient Monitoring", "HeartPulse"], ["Report Analysis", "FileText"], ["Doctor Advice", "ClipboardCheck"]];
    mods.forEach((m, i) => {
      const x = 85 + i * 225;
      shape(s, "roundRect", x, 205, 180, 190, C.white, { style: "solid", fill: C.line, width: 1 });
      shape(s, "ellipse", x + 54, 235, 72, 72, "#EAF6FF");
      text(s, m[0], x + 18, 330, 144, 54, { size: 19, bold: true, color: C.navy, align: "center" });
    });
    for (let i = 0; i < mods.length; i++) await icon(s, mods[i][1], 85 + i * 225 + 72, 253, 36, [C.blue, C.teal, C.red, C.amber, C.navy][i]);
    text(s, "Each module supports a clear clinical workflow: observe, predict, analyze, and recommend.", 120, 500, 1040, 36, { size: 23, bold: true, color: C.blue, align: "center" });
    setNotes(s, "The application is divided into functional modules. The dashboard gives an overview, the prediction module calculates risk, patient monitoring tracks records, report analysis summarizes results, and the recommendation module supports preventive clinical decisions.");
  }

  // 16
  {
    const s = base("Dashboard Screenshot", "Application");
    shape(s, "roundRect", 92, 130, 1095, 465, C.white, { style: "solid", fill: C.line, width: 1 });
    shape(s, "rect", 92, 130, 1095, 55, C.navy);
    text(s, "HeartGuard Doctor Dashboard", 120, 147, 420, 24, { size: 22, bold: true, color: C.white });
    [["Total Patients", "248", C.blue], ["High Risk Cases", "36", C.red], ["Medium Risk", "74", C.amber], ["Low Risk", "138", C.teal]].forEach((k, i) => {
      const x = 130 + i * 250;
      shape(s, "roundRect", x, 220, 205, 95, "#F8FCFF", { style: "solid", fill: C.line, width: 1 });
      text(s, k[0], x + 18, 240, 160, 22, { size: 16, bold: true, color: C.muted });
      text(s, k[1], x + 18, 266, 100, 36, { size: 34, bold: true, color: k[2] });
    });
    s.charts.add("doughnut", {
      position: { left: 155, top: 345, width: 310, height: 185 },
      categories: ["High", "Medium", "Low"],
      series: [{ name: "Risk", values: [36, 74, 138] }],
      legend: { position: "right", overlay: false },
      dataLabels: { showPercent: true, position: "outEnd", textStyle: { fontSize: 10 } },
    });
    shape(s, "roundRect", 560, 362, 530, 145, "#F8FCFF", { style: "solid", fill: C.line, width: 1 });
    text(s, "Prediction Summary", 590, 385, 240, 28, { size: 22, bold: true, color: C.navy });
    bullets(s, ["High-risk patients flagged for follow-up", "Risk categories updated after each prediction", "Doctor can review patient reports"], 592, 428, 455, 32, { size: 16 });
    setNotes(s, "This dashboard screen summarizes total patients, high-risk cases, and prediction distribution. For the viva, explain that the dashboard is designed for quick scanning by a doctor, so high-risk cases are immediately visible and can be prioritized.");
  }

  // 17
  {
    const s = base("Prediction Page Screenshot", "Application");
    shape(s, "roundRect", 95, 125, 1090, 475, C.white, { style: "solid", fill: C.line, width: 1 });
    shape(s, "rect", 95, 125, 1090, 50, C.navy);
    text(s, "New Patient Risk Prediction", 122, 141, 380, 24, { size: 22, bold: true, color: C.white });
    const fields = ["Age", "BMI", "Cholesterol", "Systolic BP", "Glucose", "Ejection Fraction", "Diabetes", "Hypertension"];
    fields.forEach((f, i) => {
      const x = 135 + (i % 2) * 295;
      const y = 210 + Math.floor(i / 2) * 68;
      text(s, f, x, y - 23, 200, 20, { size: 15, bold: true, color: C.muted });
      shape(s, "roundRect", x, y, 235, 38, "#F8FCFF", { style: "solid", fill: C.line, width: 1 });
    });
    pill(s, "Predict Risk", 215, 505, 210, C.blue);
    shape(s, "roundRect", 760, 230, 300, 190, "#FFF1F2", { style: "solid", fill: "#FECACA", width: 1 });
    text(s, "Output", 792, 258, 220, 30, { size: 24, bold: true, color: C.navy });
    text(s, "High Risk", 792, 307, 220, 42, { size: 38, bold: true, color: C.red });
    text(s, "Probability: 87%", 792, 365, 220, 26, { size: 22, bold: true, color: C.ink });
    setNotes(s, "The prediction page accepts patient inputs such as BMI, cholesterol, glucose, blood pressure, ejection fraction, and comorbidities. After submission, the backend sends the processed input to the model and returns a risk category with probability.");
  }

  // 18
  {
    const s = base("Sample Prediction Result", "Application");
    shape(s, "roundRect", 170, 155, 940, 385, C.white, { style: "solid", fill: C.line, width: 1 });
    shape(s, "rect", 170, 155, 940, 12, C.red);
    text(s, "Risk Level", 230, 215, 180, 28, { size: 22, bold: true, color: C.muted });
    text(s, "High Risk", 230, 250, 300, 52, { size: 48, bold: true, color: C.red });
    text(s, "Readmission Probability", 620, 215, 300, 28, { size: 22, bold: true, color: C.muted });
    text(s, "87%", 620, 250, 180, 58, { size: 54, bold: true, color: C.blue });
    text(s, "Confidence Score", 230, 345, 260, 28, { size: 22, bold: true, color: C.muted });
    text(s, "92%", 230, 382, 180, 50, { size: 48, bold: true, color: C.teal });
    card(s, 620, 340, 360, 125, "Preventive Actions", "Schedule follow-up, review medication, monitor blood pressure and glucose, counsel patient.", C.amber);
    setNotes(s, "This is a sample prediction result. For a high-risk patient, the system does not only show a label; it also provides probability, confidence score, and preventive action suggestions. These outputs are useful for planning follow-up and communicating risk.");
  }

  // 19
  {
    const s = base("Results and Discussion", "Results");
    s.charts.add("bar", {
      position: { left: 95, top: 150, width: 580, height: 300 },
      categories: ["Accuracy", "Precision", "Recall", "F1", "ROC-AUC"],
      series: [{ name: "XGBoost", values: [91, 89, 92, 90, 93], fill: C.blue }],
      barOptions: { direction: "column", grouping: "clustered", gapWidth: 45 },
      hasLegend: false,
      yAxis: { min: 70, max: 100, majorGridlines: { style: "solid", fill: C.line, width: 1 } },
      dataLabels: { showValue: true, position: "outEnd", textStyle: { fontSize: 12, bold: true, fill: C.ink } },
    });
    bullets(s, ["Accurate risk prediction", "Improved clinical decision support", "Better patient monitoring", "Reduced readmission risk through early action"], 745, 175, 420, 58, { size: 22 });
    text(s, "Discussion: the system is strongest as a preventive screening assistant, not as a replacement for clinical judgement.", 120, 530, 1040, 42, { size: 21, bold: true, color: C.navy, align: "center" });
    setNotes(s, "The results show that the model can classify readmission risk effectively in our project setting. The most important discussion point is that HeartGuard improves decision support and monitoring. It should be used as an assistant for doctors, with final decisions remaining clinical.");
  }

  // 20
  {
    const s = base("Advantages", "Impact");
    const adv = [["Early Detection", "SearchCheck"], ["Fast Prediction", "Zap"], ["Data-Driven Decisions", "DatabaseZap"], ["Improved Healthcare", "HeartHandshake"], ["Scalable Solution", "Network"]];
    adv.forEach((a, i) => {
      const x = 100 + i * 220;
      shape(s, "ellipse", x + 35, 190, 110, 110, "#EAF6FF");
      text(s, a[0], x, 330, 180, 52, { size: 22, bold: true, color: C.navy, align: "center" });
    });
    for (let i = 0; i < adv.length; i++) await icon(s, adv[i][1], 100 + i * 220 + 67, 222, 46, [C.blue, C.teal, C.amber, C.red, C.navy][i]);
    setNotes(s, "The key advantages are early detection, fast prediction, data-driven decisions, improved healthcare outcomes, and scalability. These points are important from an examiner perspective because they show both technical and social value.");
  }

  // 21
  {
    const s = base("Limitations", "Critical Review");
    card(s, 130, 180, 300, 210, "Data Quality", "Prediction depends on accurate and complete patient input data.", C.red);
    card(s, 490, 180, 300, 210, "Model Updates", "The model should be retrained as new hospital data becomes available.", C.amber);
    card(s, 850, 180, 300, 210, "Feature Scope", "Predictions are limited to available structured features.", C.navy);
    text(s, "Acknowledging limitations makes the project academically stronger and clinically responsible.", 160, 500, 960, 40, { size: 24, bold: true, color: C.blue, align: "center" });
    setNotes(s, "Every machine learning healthcare project has limitations. Our system depends on the quality of input data and must be updated regularly. It also uses available structured features, so additional clinical notes, ECG, or imaging data could improve future performance.");
  }

  // 22
  {
    const s = base("Future Scope", "Future Work");
    flow(s, ["IoT Devices", "Real-Time Monitoring", "Mobile App", "AI Recommendations", "Hospital Integration"], 85, 205, 1110, 95, C.teal);
    bullets(s, ["Wearable sensors for vitals", "Continuous alerts for high-risk cases", "Mobile access for doctors and patients", "Personalized recommendations", "Integration with hospital management systems"], 190, 365, 860, 44, { size: 22, dot: C.teal });
    setNotes(s, "Future scope can make HeartGuard more powerful. IoT devices can provide real-time vitals, a mobile application can improve accessibility, and AI recommendations can personalize preventive actions. Integration with hospital management systems would make the solution practical for real deployments.");
  }

  // 23
  {
    const s = base("Conclusion", "Closing");
    shape(s, "roundRect", 120, 185, 1040, 260, C.white, { style: "solid", fill: C.line, width: 1 });
    text(s, "HeartGuard successfully predicts heart failure readmission risk using Machine Learning and assists healthcare professionals in preventive patient care.", 165, 225, 950, 108, { size: 34, bold: true, color: C.navy, align: "center" });
    text(s, "The project demonstrates a complete pipeline: patient data -> preprocessing -> XGBoost model -> prediction dashboard -> preventive recommendations.", 190, 380, 900, 50, { size: 22, color: C.muted, align: "center" });
    setNotes(s, "To conclude, HeartGuard is a preventive healthcare decision-support system. It combines patient data, preprocessing, machine learning, and dashboard visualization to predict readmission risk. The project is technically complete and clinically meaningful because it helps doctors act earlier.");
  }

  // 24
  {
    const s = presentation.slides.add();
    s.background.fill = C.pale;
    shape(s, "ellipse", -120, -120, 360, 360, "#DDF3FF");
    shape(s, "ellipse", 990, 450, 360, 360, "#D7F7EF");
    await icon(s, "HeartPulse", 558, 150, 120, C.red);
    text(s, "Thank You", 330, 300, 620, 68, { size: 60, bold: true, color: C.navy, align: "center", face: "Aptos Display" });
    text(s, "Questions & Answers", 390, 384, 500, 40, { size: 30, bold: true, color: C.blue, align: "center" });
    text(s, "HEARTGUARD | Final Year B.E. Computer Engineering Project", 330, 548, 620, 24, { size: 17, color: C.muted, align: "center" });
    setNotes(s, "Thank the examiners and invite questions. If asked for a short summary, focus on the problem, architecture, dataset, XGBoost model, results, and future scope.");
  }

  await fs.writeFile(path.join(TMP, "source-notes.txt"), [
    "Deck generated for HeartGuard final year B.E. Computer Engineering viva.",
    "Research context used: Allam et al. 2018 arXiv paper on 30-day heart failure readmission prediction; Washington Post summary of AHA 2025 cardiovascular statistics.",
    "Dashboard and prediction screenshots are professionally designed mock screens because no real screenshots were supplied.",
  ].join("\n"));

  for (const [index, slide] of presentation.slides.items.entries()) {
    const stem = `slide-${String(index + 1).padStart(2, "0")}`;
    await saveBlobToFile(await presentation.export({ slide, format: "png", scale: 1 }), path.join(PREVIEW, `${stem}.png`));
    await fs.writeFile(path.join(LAYOUT, `${stem}.layout.json`), await (await slide.export({ format: "layout" })).text());
  }
  await saveBlobToFile(await presentation.export({ format: "webp", montage: true, scale: 1 }), path.join(QA, "deck-montage.webp"));
  const pptx = await PresentationFile.exportPptx(presentation);
  await pptx.save(OUT);
  console.log(`Exported ${OUT}`);
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
