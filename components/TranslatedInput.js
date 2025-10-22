
import React, { useState, useEffect, useRef } from 'react';
import { translateText } from '../services/geminiService';
import Icon from './Icon';

const TranslatedInput = ({ label, value, onChange, isTextarea = false }) => {
    const [isTranslating, setIsTranslating] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech Recognition API not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'sr-SP';
        recognition.interimResults = false;
        recognition.continuous = false;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            handleTranslate(transcript);
        };
        
        recognition.onend = () => {
            setIsRecording(false);
        };
        
        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            setIsRecording(false);
        };

        recognitionRef.current = recognition;

        return () => {
            recognitionRef.current?.stop();
        };
    }, []);

    const handleTranslate = async (textToTranslate) => {
        if (!textToTranslate) return;
        setIsTranslating(true);
        try {
            const translations = await translateText(textToTranslate, 'sr');
            onChange({
                sr: textToTranslate,
                ru: translations.ru || '',
                en: translations.en || '',
            });
        } catch (error) {
            console.error("Translation failed", error);
        } finally {
            setIsTranslating(false);
        }
    };
    
    const handleMicClick = () => {
        const recognition = recognitionRef.current;
        if (!recognition) {
            alert("Speech recognition is not supported in your browser.");
            return;
        }

        if (isRecording) {
            recognition.stop();
        } else {
            setIsRecording(true);
            recognition.start();
        }
    };

    const InputComponent = isTextarea ? 'textarea' : 'input';
    const inputClasses = "w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent transition";

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="space-y-2">
                <div className="relative">
                    <InputComponent
                        placeholder="Serbian (source for translation)"
                        value={value.sr}
                        onChange={(e) => onChange({ ...value, sr: e.target.value })}
                        className={`${inputClasses} pl-8`}
                    />
                    <span className="absolute left-2 top-2 text-gray-400 text-sm">SR</span>
                    <button 
                        type="button" 
                        onClick={handleMicClick} 
                        disabled={isTranslating} 
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-brand-secondary hover:bg-brand-primary hover:text-white transition-colors duration-200 ${isRecording ? 'bg-red-500 !text-white' : ''}`}
                    >
                        {isTranslating ? 
                            <div className="w-5 h-5 border-2 border-t-transparent border-brand-primary rounded-full animate-spin"></div> :
                            <Icon name="mic" className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`}/>
                        }
                    </button>
                </div>
                 <div>
                    <InputComponent
                        placeholder="Russian"
                        value={value.ru}
                        onChange={(e) => onChange({ ...value, ru: e.target.value })}
                        className={`${inputClasses} pl-8`}
                    />
                    <span className="absolute left-2 -mt-8 text-gray-400 text-sm">RU</span>
                </div>
                 <div>
                    <InputComponent
                        placeholder="English"
                        value={value.en}
                        onChange={(e) => onChange({ ...value, en: e.target.value })}
                        className={`${inputClasses} pl-8`}
                    />
                    <span className="absolute left-2 -mt-8 text-gray-400 text-sm">EN</span>
                </div>
            </div>
        </div>
    );
};

export default TranslatedInput;