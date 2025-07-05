<template>
  <div class="translator">
    <div class="container">
      <div class="translator-wrapper">
        <!-- <h2 class="translator-title">{{ $t('translator.title') }}</h2> -->
        
        <div class="translator-card">
          <!-- Language Selection with Method Toggle -->
          <div class="language-selection">
            <div class="language-selector">
              <label>{{ $t('translator.from') }}</label>
              <select v-model="sourceLang" class="lang-select">
                <option value="auto">{{ $t('translator.autoDetect') }}</option>
                <option value="en">English</option>
                <option value="zh-CN">中文</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="es">Español</option>
                <option value="ru">Русский</option>
              </select>
            </div>
            
            <div class="control-buttons">
              <button @click="swapLanguages" class="swap-btn" :disabled="sourceLang === 'auto'">
                <svg viewBox="0 0 24 24">
                  <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/>
                </svg>
              </button>
              
              <button @click="toggleTranslationMethod" class="method-toggle-btn" :title="translationMethod === 'google' ? 'Google Translate' : 'AI Translate'">
                <svg v-if="translationMethod === 'google'" class="method-icon" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <img v-else class="method-icon" src="/assets/ai.png" alt="AI Translate">
              </button>
            </div>
            
            <div class="language-selector">
              <label>{{ $t('translator.to') }}</label>
              <select v-model="targetLang" class="lang-select">
                <option value="zh-CN">中文</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="es">Español</option>
                <option value="ru">Русский</option>
              </select>
            </div>
          </div>

          <!-- Translation Input/Output -->
          <div class="translation-area">
            <div class="input-section">
              <div class="textarea-header">
                <span class="section-title">{{ $t('translator.inputText') }}</span>
                <div class="header-actions">
                  <span class="char-count">{{ inputText.length }}/5000</span>
                  <button @click="clearInput" class="clear-btn">{{ $t('translator.clear') }}</button>
                </div>
              </div>
              <textarea 
                v-model="inputText"
                :placeholder="$t('translator.inputPlaceholder')"
                class="input-textarea"
                maxlength="5000"
                @input="onInputChange"
              ></textarea>
            </div>
            
            <div class="output-section">
              <div class="textarea-header">
                <span class="section-title">{{ $t('translator.translationResult') }}</span>
                <div class="header-actions">
                  <span class="translation-info" v-if="lastTranslation">
                    {{ $t('translator.translatedBy') }} {{ lastTranslation.method }}
                  </span>
                  <button 
                    @click="copyToClipboard" 
                    class="copy-btn"
                    :disabled="!outputText"
                    v-if="outputText"
                  >
                    {{ $t('translator.copy') }}
                  </button>
                </div>
              </div>
              <div class="output-textarea" :class="{ loading: isTranslating }">
                <div v-if="isTranslating" class="loading-spinner">
                  <div class="spinner"></div>
                  <span>{{ $t('translator.translating') }}</span>
                </div>
                <div v-else-if="outputText" class="output-text">{{ outputText }}</div>
                <div v-else class="output-placeholder">{{ $t('translator.outputPlaceholder') }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

// Reactive data
const inputText = ref('')
const outputText = ref('')
const sourceLang = ref('auto')
const targetLang = ref('zh-CN')
const translationMethod = ref('google')
const isTranslating = ref(false)
const lastTranslation = ref(null)

// Auto-translate timer
let translateTimer = null

// Your Supabase Edge Function URL
const TRANSLATE_API_URL = import.meta.env.VITE_SUPABASE_TRANSLATE_URL || 'https://husdiczqouillhvovodl.supabase.co/functions/v1/translate'

// Bearer Token - 使用环境变量或fallback，与Reddit store保持一致
const SUPABASE_BEARER_TOKEN = import.meta.env.VITE_SUPABASE_TOKEN 
  ? `Bearer ${import.meta.env.VITE_SUPABASE_TOKEN}`
  : 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1c2RpY3pxb3VpbGxodm92b2RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4OTM2NTUsImV4cCI6MjA2NjQ2OTY1NX0.-ejxki8XiXECuGVOVVi9d5WgyHVefy0nxbu4qftMsLw'

// Translation function
const translate = async () => {
  if (!inputText.value.trim()) {
    outputText.value = ''
    return
  }
  
  isTranslating.value = true
  
  try {
    const response = await fetch(TRANSLATE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': SUPABASE_BEARER_TOKEN
      },
      body: JSON.stringify({
        text: inputText.value,
        targetLang: targetLang.value,
        method: translationMethod.value
      })
    })
    
    if (!response.ok) {
      throw new Error(`Translation failed: ${response.status}`)
    }
    
    const result = await response.json()
    
    if (result.success) {
      outputText.value = result.translatedText
      lastTranslation.value = {
        method: result.method,
        timestamp: result.timestamp
      }
    } else {
      throw new Error(result.error || 'Translation failed')
    }
    
  } catch (error) {
    console.error('Translation error:', error)
    outputText.value = `Translation failed: ${error.message}`
  } finally {
    isTranslating.value = false
  }
}

// Toggle translation method
const toggleTranslationMethod = () => {
  translationMethod.value = translationMethod.value === 'google' ? 'ai' : 'google'
}

// Auto-translate on input change
const onInputChange = () => {
  // Clear previous timer
  if (translateTimer) {
    clearTimeout(translateTimer)
  }
  
  // Set new timer for auto-translate (delay 1 second)
  translateTimer = setTimeout(() => {
    translate()
  }, 1000)
}

// Watch for language changes and auto-translate
watch([sourceLang, targetLang, translationMethod], () => {
  if (inputText.value.trim()) {
    // Clear previous timer
    if (translateTimer) {
      clearTimeout(translateTimer)
    }
    
    // Translate immediately when language changes
    translate()
  }
})

// Utility functions
const clearInput = () => {
  inputText.value = ''
  outputText.value = ''
  if (translateTimer) {
    clearTimeout(translateTimer)
  }
}

const swapLanguages = () => {
  if (sourceLang.value === 'auto') return
  
  const temp = sourceLang.value
  sourceLang.value = targetLang.value
  targetLang.value = temp
  
  // Also swap the text
  const tempText = inputText.value
  inputText.value = outputText.value
  outputText.value = tempText
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(outputText.value)
    // You could add a toast notification here
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}
</script>

<style scoped>
.translator {
  min-height: calc(100vh - 200px);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.translator-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.translator-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.translator-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.language-selection {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.language-selector {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.language-selector label {
  color: white;
  font-weight: 500;
}

.lang-select {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: white;
  font-size: 1rem;
}

.lang-select option {
  background: #333;
  color: white;
}

.control-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.swap-btn {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.swap-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.swap-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.swap-btn svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.method-toggle-btn {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.method-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.method-icon {
  width: 24px;
  height: 24px;
}

.method-icon img {
  object-fit: contain;
}

img.method-icon {
  object-fit: contain;
}

.translation-area {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

.input-section,
.output-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.textarea-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.section-title {
  font-weight: 600;
  font-size: 1rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.char-count {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
}

.translation-info {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
}

.clear-btn,
.copy-btn {
  padding: 0.25rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-btn:hover,
.copy-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.input-textarea {
  width: 100%;
  height: 250px;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  color: white;
  font-size: 1rem;
  resize: vertical;
  min-height: 200px;
  line-height: 1.5;
  font-family: inherit;
}

.input-textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.output-textarea {
  height: 250px;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  color: white;
  font-size: 1rem;
  min-height: 200px;
  position: relative;
  overflow-y: auto;
}

.output-textarea.loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.output-text {
  width: 100%;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.output-placeholder {
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .translator-title {
    font-size: 2rem;
  }
  
  .translator-card {
    padding: 1.5rem;
  }
  
  .language-selection {
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: flex-end;
    gap: 0.5rem;
  }
  
  .language-selector {
    flex: 1;
    min-width: 100px;
  }
  
  .language-selector label {
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
  }
  
  .lang-select {
    padding: 0.5rem;
    font-size: 0.9rem;
    height: 42px;
  }
  
  .control-buttons {
    flex-direction: column;
    margin-top: 1.2rem;
    order: 0;
    width: auto;
    justify-content: center;
    gap: 0.25rem;
  }
  
  .swap-btn,
  .method-toggle-btn {
    padding: 0.4rem;
    min-width: 42px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .swap-btn svg,
  .method-icon {
    width: 16px;
    height: 16px;
  }
  
  .translation-area {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .input-textarea,
  .output-textarea {
    height: 120px;
    min-height: 100px;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-end;
  }
}
</style> 