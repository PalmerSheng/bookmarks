<template>
  <div class="calculator">
    <div class="container">
      <div class="calculator-wrapper">
        <h2 class="calculator-title">{{ $t('calculator.title') }}</h2>
        
        <div class="calculator-card">
          <div class="display">
            <div class="expression">{{ expression || '0' }}</div>
            <div class="result">{{ result }}</div>
          </div>
          
          <div class="buttons">
            <!-- 第一行：清除和删除 -->
            <button @click="clear" class="btn btn-function">C</button>
            <button @click="clearEntry" class="btn btn-function">CE</button>
            <button @click="deleteLast" class="btn btn-function">⌫</button>
            <button @click="addOperator('/')" class="btn btn-operator">÷</button>
            
            <!-- 第二行：数字7-9和乘法 -->
            <button @click="addNumber('7')" class="btn btn-number">7</button>
            <button @click="addNumber('8')" class="btn btn-number">8</button>
            <button @click="addNumber('9')" class="btn btn-number">9</button>
            <button @click="addOperator('*')" class="btn btn-operator">×</button>
            
            <!-- 第三行：数字4-6和减法 -->
            <button @click="addNumber('4')" class="btn btn-number">4</button>
            <button @click="addNumber('5')" class="btn btn-number">5</button>
            <button @click="addNumber('6')" class="btn btn-number">6</button>
            <button @click="addOperator('-')" class="btn btn-operator">-</button>
            
            <!-- 第四行：数字1-3和加法 -->
            <button @click="addNumber('1')" class="btn btn-number">1</button>
            <button @click="addNumber('2')" class="btn btn-number">2</button>
            <button @click="addNumber('3')" class="btn btn-number">3</button>
            <button @click="addOperator('+')" class="btn btn-operator">+</button>
            
            <!-- 第五行：0、小数点和等于 -->
            <button @click="addNumber('0')" class="btn btn-number btn-zero">0</button>
            <button @click="addDecimal" class="btn btn-number">.</button>
            <button @click="calculate" class="btn btn-equals">=</button>
          </div>
        </div>
        
        <div class="calculator-history" v-if="history.length > 0">
          <h3>{{ $t('calculator.history') }}</h3>
          <div class="history-list">
            <div 
              v-for="(item, index) in history.slice(-5)" 
              :key="index"
              class="history-item"
              @click="loadFromHistory(item)"
            >
              <span class="history-expression">{{ item.expression }}</span>
              <span class="history-result">= {{ item.result }}</span>
            </div>
          </div>
          <button @click="clearHistory" class="clear-history-btn">
            {{ $t('calculator.clearHistory') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const expression = ref('')
const result = ref('')
const history = ref([])
const lastOperation = ref('')

const addNumber = (num) => {
  if (result.value && !lastOperation.value) {
    // 如果显示结果且不是刚进行操作，清空开始新计算
    expression.value = num
    result.value = ''
  } else {
    expression.value += num
  }
  lastOperation.value = ''
}

const addOperator = (operator) => {
  if (!expression.value) {
    if (result.value) {
      expression.value = result.value + ' ' + operator + ' '
      result.value = ''
    }
    return
  }
  
  // 如果最后一个字符是操作符，替换它
  const trimmed = expression.value.trim()
  if (['+', '-', '*', '/'].includes(trimmed.slice(-1))) {
    expression.value = trimmed.slice(0, -1) + operator + ' '
  } else {
    expression.value += ' ' + operator + ' '
  }
  lastOperation.value = operator
}

const addDecimal = () => {
  const parts = expression.value.split(/[\+\-\*\/]/)
  const lastPart = parts[parts.length - 1].trim()
  
  if (!lastPart.includes('.')) {
    if (!lastPart) {
      expression.value += '0.'
    } else {
      expression.value += '.'
    }
  }
  lastOperation.value = ''
}

const deleteLast = () => {
  if (expression.value) {
    expression.value = expression.value.slice(0, -1)
  }
  lastOperation.value = ''
}

const clear = () => {
  expression.value = ''
  result.value = ''
  lastOperation.value = ''
}

const clearEntry = () => {
  const parts = expression.value.split(/(\s[\+\-\*\/]\s)/)
  if (parts.length > 1) {
    parts.pop()
    expression.value = parts.join('')
  } else {
    expression.value = ''
  }
  lastOperation.value = ''
}

const calculate = () => {
  if (!expression.value) return
  
  try {
    // 替换显示符号为计算符号
    let calcExpression = expression.value
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
    
    // 使用Function构造函数安全计算
    const calculatedResult = Function('"use strict"; return (' + calcExpression + ')')()
    
    if (isNaN(calculatedResult) || !isFinite(calculatedResult)) {
      result.value = 'Error'
      return
    }
    
    const formattedResult = Number(calculatedResult.toFixed(10)).toString()
    result.value = formattedResult
    
    // 添加到历史记录
    history.value.push({
      expression: expression.value,
      result: formattedResult
    })
    
    lastOperation.value = '='
    
  } catch (error) {
    result.value = 'Error'
  }
}

const loadFromHistory = (item) => {
  expression.value = item.expression
  result.value = item.result
  lastOperation.value = ''
}

const clearHistory = () => {
  history.value = []
}

// 键盘支持
const handleKeyPress = (event) => {
  const key = event.key
  
  if (key >= '0' && key <= '9') {
    addNumber(key)
  } else if (key === '.') {
    addDecimal()
  } else if (key === '+') {
    addOperator('+')
  } else if (key === '-') {
    addOperator('-')
  } else if (key === '*') {
    addOperator('*')
  } else if (key === '/') {
    event.preventDefault()
    addOperator('/')
  } else if (key === 'Enter' || key === '=') {
    calculate()
  } else if (key === 'Escape') {
    clear()
  } else if (key === 'Backspace') {
    deleteLast()
  }
}

// 生命周期
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})
</script>

<style scoped>
.calculator {
  min-height: calc(100vh - 200px);
  padding: 2rem 0;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 1rem;
}

.calculator-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.calculator-title {
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

.calculator-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.display {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
}

.expression {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
  word-break: break-all;
  text-align: right;
}

.result {
  font-size: 2rem;
  font-weight: 600;
  color: white;
  word-break: break-all;
  text-align: right;
}

.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.btn {
  height: 60px;
  border: none;
  border-radius: 15px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-number {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn-number:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.btn-operator {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-operator:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  transform: translateY(-2px);
}

.btn-function {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
}

.btn-function:hover {
  background: linear-gradient(135deg, #ff5252 0%, #e65100 100%);
  transform: translateY(-2px);
}

.btn-equals {
  background: linear-gradient(135deg, #51cf66 0%, #40c057 100%);
  color: white;
  grid-column: span 2;
}

.btn-equals:hover {
  background: linear-gradient(135deg, #47b356 0%, #369e44 100%);
  transform: translateY(-2px);
}

.btn-zero {
  grid-column: span 1;
}

.calculator-history {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 1.5rem;
}

.calculator-history h3 {
  color: white;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.history-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.75rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(5px);
}

.history-expression {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.history-result {
  color: white;
  font-weight: 600;
}

.clear-history-btn {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-history-btn:hover {
  background: linear-gradient(135deg, #ff5252 0%, #e65100 100%);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .calculator-title {
    font-size: 2rem;
  }
  
  .calculator-card {
    padding: 1.5rem;
  }
  
  .buttons {
    gap: 0.75rem;
  }
  
  .btn {
    height: 50px;
    font-size: 1.1rem;
  }
  
  .display {
    padding: 1rem;
    min-height: 80px;
  }
  
  .expression {
    font-size: 1rem;
  }
  
  .result {
    font-size: 1.5rem;
  }
}
</style> 