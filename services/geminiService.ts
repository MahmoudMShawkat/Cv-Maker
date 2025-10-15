import { GoogleGenAI, Type } from "@google/genai";
import { type CvData } from '../types';

// Assume process.env.API_KEY is available in the environment
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = 'gemini-2.5-flash';

const generateContent = async (prompt: string) => {
    if (!API_KEY) {
        throw new Error("AI features are disabled. Please configure your API key.");
    }
    try {
        const response = await ai.models.generateContent({ model, contents: prompt });
        return response.text.trim();
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get AI suggestion. Please check your API key and try again.");
    }
};

export const rephraseExperienceDescription = async (jobTitle: string, currentDescription: string): Promise<string> => {
  const prompt = `You are a professional resume writer. Rephrase the following bullet points for the job title "${jobTitle}" to be more impactful and action-oriented. 
  Preserve the core information but improve the wording, use stronger action verbs, and ensure a professional tone. 
  Do not add any new information. Maintain the original number of bullet points.
  Format the output as bullet points, each starting with '•'.

  Current Description:
  ---
  ${currentDescription}
  ---

  Rephrased Description:`;

  return generateContent(prompt);
};

export const rephraseSummary = async (currentSummary: string): Promise<string> => {
  const prompt = `You are a professional resume writer. Rephrase the following professional summary to be more impactful and action-oriented. Keep it concise (around 3-4 sentences) and professional. Do not add any new information, only improve the wording and flow of the existing text.

  Current Summary:
  ---
  ${currentSummary}
  ---

  Rephrased Summary:`;

  return generateContent(prompt);
};

export const generateSummary = async (cvData: CvData, jobDescription: string): Promise<string> => {
  const prompt = `You are a professional resume writer. Using the provided CV data and the target job description, generate a compelling, 3-4 sentence professional summary. The summary should be written in the first person and highlight the candidate's most relevant skills and experiences that match the job requirements.

  Job Description:
  ---
  ${jobDescription}
  ---
  
  CV Data:
  ---
  Full Name: ${cvData.fullName}
  Experience: ${cvData.workExperience.map(w => `${w.jobTitle} at ${w.company}`).join(', ')}
  Skills: ${cvData.skills}
  ---

  Generated Summary:`;

  return generateContent(prompt);
};

export const generateDescription = async (jobTitle: string, jobDescription: string): Promise<string> => {
  const prompt = `You are a professional resume writer. For the job title "${jobTitle}", generate 3-4 concise, action-oriented bullet points for a CV. These bullet points MUST be tailored to the provided job description, highlighting responsibilities and achievements that align with what the employer is looking for. Start each bullet with a strong action verb. Do not use markdown, just plain text with each bullet on a new line started with '•'.

  Job Description:
  ---
  ${jobDescription}
  ---

  Generated bullet points for "${jobTitle}":`;

  return generateContent(prompt);
};

export const suggestSkills = async (cvData: CvData, jobDescription: string): Promise<string> => {
    const prompt = `You are a skills analyst. Based on the provided CV and the target job description, suggest a comma-separated list of 10-15 relevant technical and soft skills. Prioritize skills mentioned in the job description that are missing or underrepresented in the current CV.

    Job Description:
    ---
    ${jobDescription}
    ---

    Current CV Skills: ${cvData.skills}
    Current Job Titles: ${cvData.workExperience.map(w => w.jobTitle).join(', ')}
    ---

    Suggested Skills (comma-separated):`;

    return generateContent(prompt);
};

export const analyzeCv = async (cvText: string, jobDescription: string): Promise<any> => {
    const prompt = `You are an expert ATS (Applicant Tracking System) and a career coach. Analyze the following CV against the provided job description. Provide a response in JSON format. The score should reflect how well the CV's skills and experience align with the job requirements. Identify critical keywords from the job description that are absent in the CV. Offer 3-5 concise, actionable tips for the user to improve their CV for this specific job.

    Job Description:
    ---
    ${jobDescription}
    ---

    CV Text:
    ---
    ${cvText}
    ---
    `;

    try {
        if (!API_KEY) throw new Error("API Key not found");
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        matchScore: { type: Type.NUMBER, description: 'A score from 0 to 100 representing the match quality.' },
                        missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Critical keywords from the job description missing in the CV.' },
                        improvementTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Actionable tips to improve the CV.' }
                    }
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error analyzing CV with JSON mode:", error);
        throw new Error("Failed to analyze CV. Please try again.");
    }
};

export const generateCoverLetter = async (cvData: CvData, jobDescription: string): Promise<string> => {
    const prompt = `You are a professional career coach and writer. Write a concise and professional cover letter for a candidate applying for the position described in the job description. Use the candidate's provided CV to highlight their most relevant qualifications and experiences. The tone should be professional yet enthusiastic. The cover letter should be three paragraphs long: an introduction stating the position they're applying for, a body paragraph connecting their experience to the job requirements, and a conclusion expressing their interest and a call to action. Do not include placeholders like "[Your Name]". Use the name "${cvData.fullName}".

    Job Description:
    ---
    ${jobDescription}
    ---

    Candidate's CV:
    ---
    Name: ${cvData.fullName}
    Contact: ${cvData.email} | ${cvData.phone}
    Summary: ${cvData.summary}
    Experience: ${cvData.workExperience.map(w => `- ${w.jobTitle} at ${w.company}: ${w.description.replace(/\n/g, ' ')}`).join('\n')}
    Skills: ${cvData.skills}
    Education: ${cvData.education.map(e => `${e.degree} from ${e.university}`).join(', ')}
    ---

    Generated Cover Letter:`;
    
    return generateContent(prompt);
};