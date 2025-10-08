<template>
  <div class="meal-notes-wrapper">
    <label class="notes-label">{{ t('MealNotes.label') }}</label>
    
    <!-- Selected Notes as Chips -->
    <div v-if="selectedNotes.length > 0" class="chips-container">
      <div v-for="(note, index) in selectedNotes" :key="index" class="chip">
        <span class="chip-text">{{ note }}</span>
        <button 
          type="button" 
          class="chip-remove" 
          @click="removeNote(index)"
          aria-label="Remove note"
        >
          ❌
        </button>
      </div>
    </div>
    
    <!-- Input Field -->
    <div class="input-container">
      <input
        ref="inputElement"
        v-model="inputText"
        type="text"
        class="notes-input"
        :placeholder="t('MealNotes.placeholder')"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
        @keydown.enter.prevent="handleEnter"
        @keydown.down.prevent="navigateDown"
        @keydown.up.prevent="navigateUp"
        @keydown.esc="closeDropdown"
      />
      
      <!-- Dropdown Suggestions -->
      <div v-if="showDropdown && (filteredSuggestions.length > 0 || canAddNew)" class="dropdown">
        <!-- Existing Suggestions -->
        <button
          v-for="(suggestion, index) in filteredSuggestions"
          :key="suggestion.noteID"
          type="button"
          class="dropdown-item"
          :class="{ 'highlighted': highlightedIndex === index }"
          @mousedown.prevent="selectSuggestion(suggestion.noteText)"
          @mouseenter="highlightedIndex = index"
        >
          {{ suggestion.noteText }}
          <span class="use-count" v-if="suggestion.useCount > 1">{{ suggestion.useCount }}×</span>
        </button>
        
        <!-- Add New Option -->
        <button
          v-if="canAddNew"
          type="button"
          class="dropdown-item add-new"
          :class="{ 'highlighted': highlightedIndex === filteredSuggestions.length }"
          @mousedown.prevent="addNewNote"
          @mouseenter="highlightedIndex = filteredSuggestions.length"
        >
          {{ t('MealNotes.addNewPrefix') }}{{ trimmedInputText }}{{ t('MealNotes.addNewSuffix') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { t } from '../config/appText.js'

const props = defineProps({
  presetNotes: {
    type: Array,
    default: () => []
  },
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

// State
const inputText = ref('')
const selectedNotes = ref([])
const showDropdown = ref(false)
const highlightedIndex = ref(-1)
const inputElement = ref(null)

// Computed
const trimmedInputText = computed(() => inputText.value.trim())

const filteredSuggestions = computed(() => {
  // Convert preset notes to the format we need
  const suggestions = props.presetNotes.map(note => ({
    noteID: note.recID,
    noteText: note.notes
  }))
  
  if (!trimmedInputText.value) {
    // Show top 15 when no search text
    return suggestions.slice(0, 15)
  }
  
  // Filter suggestions based on input (case-insensitive)
  const query = trimmedInputText.value.toLowerCase()
  const filtered = suggestions.filter(s => 
    s.noteText.toLowerCase().includes(query)
  )
  
  return filtered.slice(0, 15)
})

const canAddNew = computed(() => {
  if (!trimmedInputText.value) return false
  
  // Check if the input text already exists in suggestions or selected notes
  const existsInSuggestions = filteredSuggestions.value.some(
    s => s.noteText.toLowerCase() === trimmedInputText.value.toLowerCase()
  )
  const existsInSelected = selectedNotes.value.some(
    n => n.toLowerCase() === trimmedInputText.value.toLowerCase()
  )
  
  return !existsInSuggestions && !existsInSelected
})

// Methods
const handleFocus = () => {
  showDropdown.value = true
}

const handleBlur = () => {
  // Delay to allow click events on dropdown items
  setTimeout(() => {
    showDropdown.value = false
    highlightedIndex.value = -1
  }, 200)
}

const handleInput = () => {
  showDropdown.value = true
  highlightedIndex.value = -1
}

const handleEnter = () => {
  if (highlightedIndex.value >= 0) {
    // Select highlighted item
    if (highlightedIndex.value < filteredSuggestions.value.length) {
      selectSuggestion(filteredSuggestions.value[highlightedIndex.value].noteText)
    } else if (canAddNew.value) {
      addNewNote()
    }
  } else if (trimmedInputText.value) {
    // Add the current input as new note
    addNewNote()
  }
}

const navigateDown = () => {
  const maxIndex = filteredSuggestions.value.length + (canAddNew.value ? 1 : 0) - 1
  if (highlightedIndex.value < maxIndex) {
    highlightedIndex.value++
  }
}

const navigateUp = () => {
  if (highlightedIndex.value > 0) {
    highlightedIndex.value--
  }
}

const closeDropdown = () => {
  showDropdown.value = false
  highlightedIndex.value = -1
}

const selectSuggestion = (noteText) => {
  addNote(noteText)
}

const addNewNote = () => {
  if (!trimmedInputText.value) return
  
  // Just add to selected notes - will be saved with order
  addNote(trimmedInputText.value)
}

const addNote = (noteText) => {
  const trimmed = noteText.trim()
  
  // Prevent duplicates (case-insensitive)
  const exists = selectedNotes.value.some(
    n => n.toLowerCase() === trimmed.toLowerCase()
  )
  
  if (!exists && trimmed) {
    selectedNotes.value.push(trimmed)
    updateModelValue()
  }
  
  // Clear input
  inputText.value = ''
  highlightedIndex.value = -1
  
  // Keep focus on input
  inputElement.value?.focus()
}

const removeNote = (index) => {
  selectedNotes.value.splice(index, 1)
  updateModelValue()
}

const updateModelValue = () => {
  const notesString = selectedNotes.value.join(', ')
  emit('update:modelValue', notesString)
}

// Initialize from modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    selectedNotes.value = newValue.split(',').map(n => n.trim()).filter(n => n)
  } else {
    selectedNotes.value = []
  }
}, { immediate: true })
</script>

<style scoped>
.meal-notes-wrapper {
  margin: 16px 0;
}

.notes-label {
  display: block;
  margin-bottom: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #0e3a3a;
}

.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: #e6f2ea;
  border: 1px solid #1a7a45;
  border-radius: 999px;
  font-family: 'Poppins', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #1b5a3d;
}

.chip-text {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chip-remove {
  appearance: none;
  border: none;
  background: transparent;
  padding: 0;
  font-size: 12px;
  cursor: pointer;
  line-height: 1;
  transition: transform 0.1s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chip-remove:hover {
  transform: scale(1.1);
}

.chip-remove:active {
  transform: scale(0.95);
}

.input-container {
  position: relative;
}

.notes-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 400;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.notes-input:focus {
  outline: none;
  border-color: #0e3a3a;
  box-shadow: 0 0 0 2px rgba(14, 58, 58, 0.1);
}

.notes-input::placeholder {
  color: #999;
}

.dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 240px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  -webkit-overflow-scrolling: touch;
}

.dropdown-item {
  width: 100%;
  padding: 12px 14px;
  border: none;
  background: transparent;
  text-align: left;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #0e3a3a;
  cursor: pointer;
  transition: background 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.dropdown-item:hover,
.dropdown-item.highlighted {
  background: #f0f0f0;
}

.dropdown-item:active {
  background: #e0e0e0;
}

.dropdown-item.add-new {
  color: #1a7a45;
  font-weight: 600;
  border-top: 1px solid #eee;
}

.dropdown-item.add-new:hover,
.dropdown-item.add-new.highlighted {
  background: #e6f2ea;
}

.add-icon {
  margin-right: 4px;
  font-size: 12px;
}

.use-count {
  font-size: 11px;
  color: #999;
  font-weight: 500;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .dropdown {
    max-height: 200px;
  }
  
  .chip-text {
    max-width: 150px;
  }
}

/* Scrollbar styling for dropdown */
.dropdown::-webkit-scrollbar {
  width: 8px;
}

.dropdown::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 0 8px 8px 0;
}

.dropdown::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.dropdown::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>

