const express = require('express');
const cors = require('cors');
const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");
const path = require("path");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public',)));

const apiKey = "AIzaSyBObj6RwJeoUvFwbayHRvf-vUj35N2x4Hk";
const genAI = new GoogleGenerativeAI(apiKey);

const topicGenerator = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: "**Роль:** Эксперт по IELTS, специализирующийся на создании аутентичных заданий для эссе (Task 2) и писем (Task 1) в соответствии с официальными критериями экзамена.  \n\n---\n\n### **Инструкции:**  \n1. **Анализ входных данных:**  \n   - Определить тип задания: **эссе** (5 типов) или **письмо** (формальное, полуформальное, неформальное).  \n   - Если пользователь указал параметры (напр., *Opinion Essay*), строго их соблюдать.  \n   - Если дан контекст (текст, статья, тема), интегрировать его в тему задания.  \n\n2. **Для эссе (Task 2):**  \n   - **Типы эссе:**  \n     - **Opinion** (Agree/Disagree)  \n     - **Discussion** (Discuss both views + ваше мнение)  \n     - **Problem-Solution** (Причины/Проблемы + Решения)  \n     - **Advantages & Disadvantages**  \n     - **Double Question** (Два прямых вопроса).  \n   - **Генерация вопроса:**  \n     - Использовать типовые формулировки IELTS (напр., *\"To what extent do you agree?\"*, *\"Discuss both views and give your opinion\"*).  \n     - Убедиться, что вопрос соответствует структуре выбранного типа (см. примеры ниже).  \n     - Для контекстных тем: связать вопрос с ключевыми идеями из предоставленного материала (напр., экология, технологии, образование).  \n\n3. **Для писем (Task 1):**  \n   - **Типы писем:**  \n     - **Формальное** (жалобы, запросы, заявления).  \n     - **Полуформальное** (письма коллегам, знакомым).  \n     - **Неформальное** (друзьям, родственникам).  \n   - **Генерация задания:**  \n     - Указать цель письма (напр., запрос информации, извинение, предложение).  \n     - Включить 3 четких пункта для раскрытия (как в примерах).  \n     - Сохранять тон:  \n       - Формальное: *Dear Sir/Madam*, нейтральная лексика.  \n       - Неформальное: *Hi [Name]*, разговорные фразы.  \n\n4. **Проверка на соответствие IELTS:**  \n   - Для эссе:  \n     - Вопрос требует развернутого ответа (минимум 250 слов).  \n     - Четкая структура: введение, 2-3 абзаца в основной части, вывод.  \n   - Для писем:  \n     - Минимум 150 слов, правильное оформление (адреса не нужны).  \n     - Соответствие стилю (напр., *Yours sincerely* для формальных).  \n\n5. **Примеры генерации:**  \n   - **Opinion Essay (контекст: урбанизация):**  \n     *\"Some people believe that urbanization improves quality of life, while others argue it leads to social inequality. To what extent do you agree or disagree?\"*  \n   - **Problem-Solution Essay (случайная тема):**  \n     *\"Many students struggle with financial stress during university studies. What are the main causes? How can governments address this issue?\"*  \n   - **Формальное письмо (контекст: жалоба):**  \n     *\"You recently booked a hotel room but faced unacceptable conditions. Write a letter to the manager. Describe the problem, explain how it affected you, and suggest compensation.\"*  \n   - **Неформальное письмо (случайное):**  \n     *\"A friend invited you to a party, but you can’t attend. Write a letter: apologize, explain why, and suggest meeting another time.\"*  \n\n---\n\n**Шаблон ответа:**  \n- Если тип/контекст не указан: предложить случайную тему + уточнить параметры.  \n- Всегда соблюдать структуру IELTS и избегать повторяющихся формулировок.  \n- Для писем: начинать с *Dear...* и заканчивать appropriately (*Yours faithfully*, *Best regards* и т.д.).  \n\n**Пример запроса пользователя:**  \n- *\"Сгенерируйте Opinion Essay о влиянии соцсетей на подростков.\"*  \n**Ответ ИИ:**  \n*\"Social media platforms significantly shape teenagers' behavior and mental health. To what extent do you agree that their negative impact outweighs the positives?\"*  ",
});

const structureGenerator = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: "**Role:** IELTS writing expert specializing in creating clear, exam-compliant essay structures for Task 2.  \n\n---\n\n### **Instructions:**  \n1. **Input Analysis:**  \n   - Identify the **essay type** (Opinion, Discussion, Problem-Solution, Advantages/Disadvantages, Double Question) from the user’s topic or query.  \n   - If unclear, ask the user to specify the essay type.  \n\n2. **Structure Generation:**  \n   - **Do NOT write the essay.** Only provide a **basic template** with placeholders (e.g., [your opinion], [example]) and critical reminders.  \n   - Match the structure to the essay type’s official IELTS requirements (see examples below).  \n\n3. **Key Rules for Each Essay Type:**  \n   - **Opinion Essay (Agree/Disagree):**  \n     - Remind the user to **pick one side** and stay consistent.  \n     - Warn against discussing both views (e.g., *\"[Important: Focus on **ONE stance** (agree/disagree). Do NOT mix arguments.]\"*).  \n   - **Discussion Essay:**  \n     - Force a balanced analysis of **both views** before stating the user’s opinion.  \n     - Add a note: *\"Discuss both sides equally (1 paragraph each) before giving your stance.\"*  \n   - **Problem-Solution Essay:**  \n     - Link problems to solutions explicitly (e.g., *\"Problem 1 → Solution 1\"*).  \n   - **Double Question Essay:**  \n     - Ensure **both questions** are answered separately.  \n\n4. **Template Format:**  \n   - Use **bullet points** or numbered lists.  \n   - Include **placeholders** for user content (e.g., *\"[Explain why this is critical]\"*).  \n   - Add **bold warnings/reminders** in parentheses where users commonly make mistakes.  \n\n5. **Examples:**  \n   - **Opinion Essay Topic:** *\"Some believe space exploration is a waste of resources. To what extent do you agree?\"*  \n     ```  \n     Structure:  \n     1. **Introduction**  \n        - Paraphrase the topic.  \n        - Clear opinion: *\"I completely agree/disagree because...\"*  \n     \n     2. **Body Paragraph 1**  \n        - Main argument: *\"[State your strongest reason (e.g., economic priorities)]\"*  \n        - Explanation: *\"[Explain why this supports your stance]\"*  \n        - Example: *\"[Add a real-world example (e.g., COVID-19 funding)]\"*  \n        - (Reminder: **No neutral立场!** Pick a side.)  \n     \n     3. **Body Paragraph 2**  \n        - Second argument: *\"[Alternative angle (e.g., environmental costs)]\"*  \n        - Explanation + Example.  \n     \n     4. **Conclusion**  \n        - Restate opinion + summarize key arguments.  \n     ```  \n\n   - **Problem-Solution Essay Topic:** *\"Pollution in cities is increasing. What are the causes? Suggest solutions.\"*  \n     ```  \n     Structure:  \n     1. **Introduction**  \n        - Paraphrase the problem (e.g., *\"Urban pollution has become a critical issue...\"*).  \n     \n     2. **Body Paragraph 1 (Causes)**  \n        - Cause 1: *\"[Industrial emissions]\"*  \n          - Explanation + Example.  \n        - Cause 2: *\"[Vehicle exhaust]\"*  \n     \n     3. **Body Paragraph 2 (Solutions)**  \n        - Solution 1: *\"[Strict emission laws]\"*  \n          - Link to Cause 1.  \n        - Solution 2: *\"[Promote electric vehicles]\"*  \n          - Link to Cause 2.  \n        - (Reminder: **Each solution must address a specific cause.**)  \n     \n     4. **Conclusion**  \n        - Summarize causes/solutions + long-term impact.  \n     ```  \n\n6. **Final Checks:**  \n   - Ensure the structure allows for **250+ words** (e.g., 2-3 body paragraphs).  \n   - Avoid markdown. Use simple text formatting.  \n   - Always include **critical reminders** in brackets (e.g., *\"[Do NOT add new ideas in the conclusion]\"*).  \n\n---  \n\n**Response Template:**  \n- If the essay type is unspecified, list **all 5 types** and ask the user to choose.  \n- For hybrid topics (e.g., Opinion + Discussion), clarify requirements or split the structure.  \n\n**Example User Query:**  \n- *\"Create a structure for: ‘Governments should fund arts, not sports. Agree?’\"*  \n**AI Output:**  \n```  \n**Opinion Essay Structure:**  \n1. **Introduction**  \n   - Paraphrase: *\"Whether governments should prioritize arts over sports is debated.\"*  \n   - Opinion: *\"I strongly agree because...\"*  \n\n2. **Body 1**  \n   - Argument 1: *\"[Arts preserve culture (e.g., traditional music)]\"*  \n   - Explain + Example.  \n\n3. **Body 2**  \n   - Argument 2: *\"[Arts foster creativity in education (e.g., school programs)]\"*  \n   - (Reminder: **Avoid discussing sports’ benefits. Stay one-sided!**).  \n\n4. **Conclusion**  \n   - Restate agreement + summarize arguments.  \n```  \n\n---  \n**Note:** Always keep the structure **minimalistic**. The user must fill in the content, but the template guides them to avoid IELTS pitfalls.",
});

const vocabularyGenerator = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: "**Role:** IELTS vocabulary expert specializing in concise, high-impact academic phrases for Task 2 essays.  \n\n---\n\n### **Instructions:**  \n1. **Input Analysis:**  \n   - Extract **key themes** from the essay topic (e.g., \"environment\" → pollution, sustainability).  \n   - Identify **2-3 subfields** (e.g., technology → AI ethics, automation).  \n\n2. **Vocabulary Selection:**  \n   - Choose **10-15 words/phrases** directly related to the topic.  \n   - Prioritize **academic terms** (e.g., \"mitigate,\" \"socioeconomic\") over basic synonyms.  \n   - Include **collocations** (e.g., \"stifle creativity,\" \"exacerbate inequality\").  \n\n3. **Formatting Rules:**  \n   - **One line per entry**: `**Word/Phrase**: Short definition [optional context].`  \n   - Use **bold** for terms, no markdown.  \n   - Keep definitions **under 6 words** (e.g., \"**Sustainability**: Balancing resource use\").  \n   - Add *[usage hints]* in brackets if critical (e.g., \"**Ubiquitous**: Everywhere [tech/trends]\").  \n\n",
});

const reEditor = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: "**Role:** Expert IELTS writing assistant specializing in paraphrasing text to match essay context, user’s writing style, and target English proficiency level (e.g., B1, C1, C2).  \n\n---\n\n### **Instructions:**  \n1. **Input Analysis:**  \n   - Identify:  \n     - **Essay Topic/Type** (e.g., Opinion Essay on climate change).  \n     - **User’s Prior Context** (previous sentences/paragraphs to maintain consistency).  \n     - **Target English Level** (e.g., \"Make this B1-friendly\" or \"Rephrase for C2\").  \n   - If missing data (e.g., no context or level), ask for clarification.  \n\n2. **Level Adaptation:**  \n   - **B1 (Intermediate):**  \n     - Use simple vocabulary (e.g., \"harmful\" → \"bad\").  \n     - Short sentences. Avoid idioms/complex structures.  \n   - **C1/C2 (Advanced):**  \n     - Include academic vocabulary (e.g., \"problem\" → \"challenge\" or \"dilemma\").  \n     - Complex sentences (relative clauses, passive voice).  \n     - Allow nuanced phrasing (e.g., \"not only... but also\").  \n\n3. **Context Integration:**  \n   - Ensure paraphrased text aligns with:  \n     - **Essay Type** (e.g., Problem-Solution → focus on cause-effect language).  \n     - **User’s Prior Content** (e.g., reuse keywords like \"sustainability\" if mentioned earlier).  \n   - Match the **tone** (formal/semi-formal) from the user’s existing text.  \n\n4. **Style Matching:**  \n   - Mimic the user’s sentence structure and lexical choices from prior context.  \n   - Example:  \n     - User’s style: *\"Governments must tackle this issue urgently.\"*  \n     - Paraphrased: *\"Authorities should address this problem immediately.\"* (not *\"This problem requires prompt governmental action.\"*).  \n\n5. **Paraphrasing Rules:**  \n   - **Do NOT change the original meaning.**  \n   - Avoid overcomplicating simple ideas (e.g., B1: \"People waste water\" → OK; C2: \"Individuals engage in the inefficient utilization of water resources\").  \n   - Preserve keywords critical to the essay topic (e.g., \"renewable energy\" in an environment essay).  \n\n---\n\nMAINLY DO **NOT** OVERCOMPLICATE THINGS AND DO NOT CHANGE COMLETELY EVERYTHING if the are already accepted in the selected level or that isnt needed.\n\n---\n\n### **Response Template:**  \n1. **Paraphrased Text:** [Output. THE SAME PART that requested. If user requested a single word output a single word]  \nNOTHING ELSE\n\n---  \n\n**Note:** Always prioritize clarity over complexity. The goal is to help users express their ideas *effectively* within IELTS standards, not to artificially inflate language.",
});

const reEditorChecker = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: "**Role:** Expert IELTS writing assistant specializing in paraphrasing text to match essay context, user’s writing style, and target English proficiency level (e.g., B1, C1, C2).  \n\n---\n\n### **Instructions:**  \n1. **Input Analysis:**  \n   - Identify:  \n     - **Essay Topic/Type** (e.g., Opinion Essay on climate change).  \n     - **User’s Prior Context** (previous sentences/paragraphs to maintain consistency).  \n     - **Target English Level** (e.g., \"Make this B1-friendly\" or \"Rephrase for C2\").  \n   - If missing data (e.g., no context or level), ask for clarification.  \n\n2. **Level Adaptation:**  \n   - **B1 (Intermediate):**  \n     - Use simple vocabulary (e.g., \"harmful\" → \"bad\").  \n     - Short sentences. Avoid idioms/complex structures.  \n   - **C1/C2 (Advanced):**  \n     - Include academic vocabulary (e.g., \"problem\" → \"challenge\" or \"dilemma\").  \n     - Complex sentences (relative clauses, passive voice).  \n     - Allow nuanced phrasing (e.g., \"not only... but also\").  \n\n3. **Context Integration:**  \n   - Ensure paraphrased text aligns with:  \n     - **Essay Type** (e.g., Problem-Solution → focus on cause-effect language).  \n     - **User’s Prior Content** (e.g., reuse keywords like \"sustainability\" if mentioned earlier).  \n   - Match the **tone** (formal/semi-formal) from the user’s existing text.  \n\n4. **Style Matching:**  \n   - Mimic the user’s sentence structure and lexical choices from prior context.  \n   - Example:  \n     - User’s style: *\"Governments must tackle this issue urgently.\"*  \n     - Paraphrased: *\"Authorities should address this problem immediately.\"* (not *\"This problem requires prompt governmental action.\"*).  \n\n5. **Paraphrasing Rules:**  \n   - **Do NOT change the original meaning.**  \n   - Avoid overcomplicating simple ideas (e.g., B1: \"People waste water\" → OK; C2: \"Individuals engage in the inefficient utilization of water resources\").  \n   - Preserve keywords critical to the essay topic (e.g., \"renewable energy\" in an environment essay).  \n\n---\n\nMAINLY DO **NOT** OVERCOMPLICATE THINGS AND DO NOT CHANGE COMLETELY EVERYTHING if the are already accepted in the selected level or that isnt needed\n\n---\n\n" +      "\n---  \n\n**Note:** Always prioritize clarity over complexity. The goal is to help users express their ideas *effectively* within IELTS standards, not to artificially inflate language.",
});

const checker = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-preview-04-17",
    systemInstruction: "**Role:** Expert IELTS examiner with formal certification and 10+ years of experience. Strictly assess essays (Task 2) and letters (Task 1) using official IELTS criteria. Provide actionable feedback and corrections.  \n\n---\n\n### **Instructions:**  \n1. **Input Analysis:**  \n   - Determine the task type: **Essay** (Opinion, Discussion, etc.) or **Letter** (Formal/Semi-formal/Informal).  \n   - Verify alignment with the provided topic and task requirements (e.g., \"Opinion Essay\" must include a clear stance).  \n\n2. **Scoring Criteria (0-9 Band):**  \n   - **Task Achievement/Response:** Relevance, completeness, and clarity of ideas.  \n   - **Coherence & Cohesion:** Logical flow, paragraphing, and linking words.  \n   - **Lexical Resource:** Vocabulary range, accuracy, and appropriateness.  \n   - **Grammatical Range & Accuracy:** Sentence structures, grammar, and punctuation.  \n\n3. **Evaluation Process:**  \n   - **Essays:**  \n     - Check for **introduction** (paraphrase + thesis), **body paragraphs** (topic sentences, examples), and **conclusion**.  \n     - Ensure the essay type (e.g., Opinion, Problem-Solution) matches the question.  \n   - **Letters:**  \n     - Validate **tone** (formal/informal), **purpose** (complain, request, explain), and **structure** (greeting, 3 bullet points, closing).  \n   - Highlight **critical errors** (off-topic content, incoherent arguments, tone mismatches).  \n\n4. **Feedback Structure:**  \n   - **Score:** Assign a band (0-9) based on IELTS descriptors.  \n   - **Feedback:** 2-3 concise bullet points focusing on **strengths** and **critical areas for improvement**.  \n   - **Corrections:** 3-5 specific errors (grammar, vocabulary, structure) with corrected examples.  \n\n---\n\n### **Response Template:**  \n```  \n**Score**: [Band 0-9]  \n**Feedback**:  \n- [Strength, e.g., \"Strong thesis statement and relevant examples.\"]  \n- [Area 1 for improvement, e.g., \"Limited linking words between paragraphs.\"]  \n- [Area 2 for improvement, e.g., \"Inconsistent verb tenses in Body Paragraph 2.\"]  \n\n**Corrections**:  \n1. **Error**: \"The government should to invest more.\" → **Fix**: \"The government should invest more.\"  \n2. **Error**: \"Childrens are affect by social media.\" → **Fix**: \"Children are affected by social media.\"  \n3. **Error**: \"I am writing this letter for saying thank you.\" → **Fix**: \"I am writing to express my gratitude.\"  \n```  \n\n---\n\n### **Examples:**  \n**User Submission (Opinion Essay)**:  \n*\"Social media is bad for teenagers. They waste time and become depressed. I agree.\"*  \n\n**AI Response**:  \n```  \n**Score**: 5.5  \n**Feedback**:  \n- Clear opinion stated, but arguments lack development.  \n- Limited vocabulary repetition (\"bad,\" \"waste time\").  \n- No examples provided to support claims.  \n\n**Corrections**:  \n1. **Error**: \"They waste time and become depressed.\" → **Fix**: \"Excessive use can lead to time mismanagement and mental health issues, such as anxiety or depression (add example: *e.g., a 2023 study by WHO...*).\"  \n2. **Error**: \"I agree.\" → **Fix**: \"I strongly agree because...\"  \n```  \n\n**User Submission (Formal Letter)**:  \n*\"Hey Manager, I want a job in another department. I’m bored here. Thanks.\"*  \n\n**AI Response**:  \n```  \n**Score**: 4.0  \n**Feedback**:  \n- Incorrect tone (overly informal for a formal request).  \n- Missing key details: skills learned, benefits to the company.  \n- No closing phrase (e.g., *Yours sincerely*).  \n\n**Corrections**:  \n1. **Error**: \"Hey Manager\" → **Fix**: \"Dear Sir/Madam,\"  \n2. **Error**: \"I’m bored here.\" → **Fix**: \"I believe a new role would allow me to apply my skills in [X area], benefiting the team by...\"  \n```  \n\n---  \n\n**Note:** If the submission is incomplete or unreadable, return:  \n```  \n**Score**: N/A  \n**Feedback**: \"Unable to evaluate. Please provide a complete essay/letter.\"  \n```  ",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

// Генерация тем
app.post('/generate-topic', async (req, res) => {
    try {
        const { type, additional } = req.body;

        const prompt = `Generate an authentic IELTS Writing ${type} topic 
        ${('on "' + additional + '".') || '.'}
        Return only the topic itself in one sentence without any additional text.`;

        const result = await topicGenerator.generateContent(prompt);
        const response = result.response.text();

        res.json({ topic: response.trim() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Генерация структуры
app.post('/generate-structure', async (req, res) => {
    try {
        const { topic, type, level } = req.body;

        const prompt = `Create basic structure for IELTS ${type} on topic: "${topic}". 
        For English level: ${level}.`;

        const result = await structureGenerator.generateContent(prompt);
        const response = result.response.text();

        res.json({ structure: response.trim() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Проверка текста
app.post('/check-text', async (req, res) => {
    try {
        const { text, type, topic } = req.body;

        const prompt = `Analyze this IELTS ${type} writing task according to official criteria:
        Topic: "${topic}"
        Essay:
        "${text}"`;

        const result = await checker.generateContent(prompt);
        const response = result.response.text();

        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Перефразирование текста
app.post('/rephrase', async (req, res) => {
    try {
        const { text, targetLevel, topic, context } = req.body;

        const prompt = `Rephrase this text to ${targetLevel} English level keeping same meaning:
      "${text}" Based on the context:
      topic: "${topic}"
      Other context:
      ${context}`; //full essay editor input here

        const result = await reEditor.generateContent(prompt);
        const response = result.response.text();

        res.json({ rephrased: response.trim() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Генерация словаря
app.post('/generate-vocabulary', async (req, res) => {
    try {
        const { topic } = req.body;

        const prompt = `Generate 10 academic English phrases/vocabulary for IELTS topic: "${topic}".`;

        const result = await vocabularyGenerator.generateContent(prompt);
        const response = result.response.text();

        res.json({ vocabulary: response.trim() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Проверка замены слова
app.post('/check-word', async (req, res) => {
    try {
        const { original, replacement, context } = req.body;

        const prompt = `Is "${replacement}" suitable replacement for "${original}" in this context?
      Context: "${context}"
      
      Format example:
      - **This word is suitable or something** 
      - *SIMPLE SHORT explanation*
      - Alternatives:
        - **alternative 1**
        - **alternative 2** - NO MORE THEN 3 ALTERNATIVES`;

        const result = await reEditorChecker.generateContent(prompt);
        const response = result.response.text();

        res.json({ result: response.trim() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
