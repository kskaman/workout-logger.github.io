// ./src/scripts/workout-history.js

document.addEventListener('DOMContentLoaded', () => {
    const historyContainer = document.getElementById('history-container')
    const modalOverlay = document.getElementById('modal-overlay')
    const modalContent = document.getElementById('modal-content')
    const closeModalButton = document.getElementById('close-modal-button')

    // Get currentUser from sessionStorage
    const currentUser = sessionStorage.getItem('currentUser')

    if (!currentUser) {
        alert('No user is currently logged in.')
        window.location.href = './login.html'
        return
    }

    const users = JSON.parse(localStorage.getItem('users')) || {}

    if (!users[currentUser]) {
        alert('User not found.')
        window.location.href = './login.html'
        return
    }

    let workouts = users[currentUser].workouts || []

    function formatDate(dateString) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' }
        const date = new Date(dateString)
        return date.toLocaleDateString(undefined, options)
    }

    function renderWorkoutHistory() {
        historyContainer.innerHTML = ''

        if (workouts.length === 0) {
            historyContainer.textContent = 'No past workouts found.'
            return
        }

        // Create table
        const table = document.createElement('table')
        table.classList.add('workout-table')

        // Create table header
        const thead = document.createElement('thead')
        const headerRow = document.createElement('tr')
        const headers = ['Date', 'Workout Name', '']

        headers.forEach(headerText => {
            const th = document.createElement('th')
            if (headerText !== '') {
                th.textContent = headerText
            }
            headerRow.appendChild(th)
        })

        thead.appendChild(headerRow)
        table.appendChild(thead)

        // Create table body
        const tbody = document.createElement('tbody')

        workouts.forEach((workout, index) => {
            const row = document.createElement('tr')
            row.dataset.workoutIndex = index

            const dateCell = document.createElement('td')
            dateCell.textContent = formatDate(workout.date)

            const nameCell = document.createElement('td')
            nameCell.textContent = workout.name

            const actionCell = document.createElement('td')

            // Create action buttons
            const viewButton = document.createElement('button')
            viewButton.textContent = 'View'
            viewButton.classList.add('btn-secondary')
            viewButton.id = `view-button-${index}`

            const editButton = document.createElement('button')
            editButton.textContent = 'Edit'
            editButton.classList.add('btn-secondary')
            editButton.id = `edit-button-${index}`

            const deleteButton = document.createElement('button')
            deleteButton.textContent = 'Delete'
            deleteButton.classList.add('btn-secondary')
            deleteButton.id = `delete-button-${index}`

            // Append buttons to action cell
            actionCell.appendChild(viewButton)
            actionCell.appendChild(editButton)
            actionCell.appendChild(deleteButton)

            // Append cells to row
            row.appendChild(dateCell)
            row.appendChild(nameCell)
            row.appendChild(actionCell)

            tbody.appendChild(row)
        })

        table.appendChild(tbody)
        historyContainer.appendChild(table)

        // Add event listeners
        addEventListeners()
    }

    function addEventListeners() {
        workouts.forEach((workout, index) => {
            const viewButton = document.getElementById(`view-button-${index}`)
            const editButton = document.getElementById(`edit-button-${index}`)
            const deleteButton = document.getElementById(`delete-button-${index}`)

            viewButton.addEventListener('click', (event) => {
                event.stopPropagation()
                openModal('view', index)
            })

            editButton.addEventListener('click', (event) => {
                event.stopPropagation()
                openModal('edit', index)
            })

            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation()
                deleteWorkout(index)
            })
        })
    }

    function openModal(mode, index) {
        const workout = workouts[index]
        modalContent.innerHTML = '' // Clear previous content

        if (mode === 'view') {
            renderViewModal(workout)
        } else if (mode === 'edit') {
            renderEditModal(workout, index)
        }

        // Show the modal
        modalOverlay.style.display = 'block'
        document.body.classList.add('modal-open')
    }

    function renderViewModal(workout) {
        const modalHeader = document.createElement('div')
        modalHeader.classList.add('modal-header')

        const modalTitle = document.createElement('h2')
        modalTitle.textContent = workout.name

        const modalDate = document.createElement('p')
        modalDate.textContent = `Date: ${formatDate(workout.date)}`

        modalHeader.appendChild(modalTitle)
        modalHeader.appendChild(modalDate)

        const modalBody = document.createElement('div')
        modalBody.classList.add('modal-body')

        workout.exercises.forEach(exercise => {
            const exerciseDiv = document.createElement('div')
            exerciseDiv.classList.add('exercise-item')

            const exerciseHeader = document.createElement('h3')
            exerciseHeader.textContent = `${exercise.name} (${exercise.type})`

            exerciseDiv.appendChild(exerciseHeader)

            // Create table for sets
            const setsTable = createSetsTable(exercise)
            exerciseDiv.appendChild(setsTable)
            modalBody.appendChild(exerciseDiv)
        })

        modalContent.appendChild(modalHeader)
        modalContent.appendChild(modalBody)
    }

    function renderEditModal(workout, index) {
        const form = document.createElement('form')
        form.id = 'edit-workout-form'

        // Workout name input
        const workoutNameGroup = document.createElement('div')
        workoutNameGroup.classList.add('form-group')

        const workoutNameLabel = document.createElement('label')
        workoutNameLabel.textContent = 'Workout Name'
        workoutNameLabel.setAttribute('for', 'edit-workout-name')

        const workoutNameInput = document.createElement('input')
        workoutNameInput.type = 'text'
        workoutNameInput.value = workout.name
        workoutNameInput.required = true
        workoutNameInput.id = 'edit-workout-name'

        workoutNameGroup.appendChild(workoutNameLabel)
        workoutNameGroup.appendChild(workoutNameInput)

        // Workout date input
        const workoutDateGroup = document.createElement('div')
        workoutDateGroup.classList.add('form-group')

        const workoutDateLabel = document.createElement('label')
        workoutDateLabel.textContent = 'Date'
        workoutDateLabel.setAttribute('for', 'edit-workout-date')

        const workoutDateInput = document.createElement('input')
        workoutDateInput.type = 'date'
        workoutDateInput.value = workout.date
        workoutDateInput.required = true
        workoutDateInput.id = 'edit-workout-date'

        workoutDateGroup.appendChild(workoutDateLabel)
        workoutDateGroup.appendChild(workoutDateInput)

        form.appendChild(workoutNameGroup)
        form.appendChild(workoutDateGroup)

        // Exercises container
        const exercisesContainer = document.createElement('div')
        exercisesContainer.id = 'edit-exercise-container'

        // Add existing exercises
        workout.exercises.forEach((exercise, idx) => {
            addExerciseToForm(exercise, idx + 1, exercisesContainer, users, currentUser, 'edit')
        })

        // Add Exercise button
        const addExerciseButton = document.createElement('button')
        addExerciseButton.type = 'button'
        addExerciseButton.textContent = 'Add Exercise'
        addExerciseButton.classList.add('btn-secondary')
        addExerciseButton.addEventListener('click', () => {
            addExerciseToForm(null, null, exercisesContainer, users, currentUser, 'edit')
        })

        form.appendChild(exercisesContainer)
        form.appendChild(addExerciseButton)

        // Save Workout button
        const saveButton = document.createElement('button')
        saveButton.type = 'button'
        saveButton.textContent = 'Save Workout'
        saveButton.classList.add('btn-primary')
        saveButton.style.display = 'none' // Initially hidden
        saveButton.id = 'edit-save-workout-button'
        saveButton.addEventListener('click', () => {
            saveEditedWorkout(index)
        })

        form.appendChild(saveButton)
        modalContent.appendChild(form)

        // Initial check for Save button visibility
        checkEditSaveWorkoutButtonVisibility()
    }

    function checkEditSaveWorkoutButtonVisibility() {
        const exercisesContainer = document.getElementById('edit-exercise-container')
        const exerciseDivs = exercisesContainer.querySelectorAll('.exercise')
        const saveWorkoutButton = document.getElementById('edit-save-workout-button')

        let hasExerciseWithSet = false

        exerciseDivs.forEach(exerciseDiv => {
            const setsContainer = exerciseDiv.querySelector('.sets-container')
            const setRows = setsContainer.querySelectorAll('.set-row')
            if (setRows.length > 0) {
                hasExerciseWithSet = true
            }
        })

        if (exerciseDivs.length > 0 && hasExerciseWithSet) {
            saveWorkoutButton.style.display = 'block'
        } else {
            saveWorkoutButton.style.display = 'none'
        }
    }

    function createSetsTable(exercise) {
        const setsTable = document.createElement('table')
        setsTable.classList.add('sets-table')

        // Table header
        const thead = document.createElement('thead')
        const headerRow = document.createElement('tr')
        const headers = ['Set', 'Reps']
        if (exercise.type === 'resistance-band' || exercise.type === 'weighted') {
            headers.push('Weight')
        }

        headers.forEach(headerText => {
            const th = document.createElement('th')
            th.textContent = headerText
            headerRow.appendChild(th)
        })

        thead.appendChild(headerRow)
        setsTable.appendChild(thead)

        // Table body
        const tbody = document.createElement('tbody')

        exercise.sets.forEach((set, idx) => {
            const row = document.createElement('tr')

            const setNumberCell = document.createElement('td')
            setNumberCell.textContent = idx + 1

            const repsCell = document.createElement('td')
            repsCell.textContent = set.reps

            row.appendChild(setNumberCell)
            row.appendChild(repsCell)

            if (exercise.type === 'resistance-band' || exercise.type === 'weighted') {
                const weightCell = document.createElement('td')
                weightCell.textContent = set.weight
                row.appendChild(weightCell)
            }

            tbody.appendChild(row)
        })

        setsTable.appendChild(tbody)
        return setsTable
    }

    function saveEditedWorkout(index) {
        const workoutNameInput = document.getElementById('edit-workout-name')
        const workoutDateInput = document.getElementById('edit-workout-date')
        const exercisesContainer = document.getElementById('edit-exercise-container')

        const workoutName = workoutNameInput.value.trim()
        const workoutDate = workoutDateInput.value.trim()

        if (workoutName === '' || workoutDate === '') {
            alert('Please enter workout name and date.')
            return
        }

        const exercises = []
        const exerciseDivs = exercisesContainer.querySelectorAll('.exercise')

        if (exerciseDivs.length === 0) {
            alert('Please add at least one exercise.')
            return
        }

        let allExercisesValid = true

        exerciseDivs.forEach(exerciseDiv => {
            const exerciseId = exerciseDiv.dataset.exerciseId
            const exerciseNameInput = exerciseDiv.querySelector(`input[name="exercise-name-${exerciseId}"]`)
            const exerciseTypeSelect = exerciseDiv.querySelector(`select[name="exercise-type-${exerciseId}"]`)
            const setsContainer = exerciseDiv.querySelector('.sets-container')

            const exerciseName = exerciseNameInput.value.trim()
            const exerciseType = exerciseTypeSelect.value

            if (exerciseName === '' || exerciseType === '') {
                alert('Enter name and type for each exercise.')
                allExercisesValid = false
                return
            }

            const setRows = setsContainer.querySelectorAll('.set-row')

            if (setRows.length === 0) {
                alert('Each exercise must have at least one set.')
                allExercisesValid = false
                return
            }

            const sets = []
            let allSetsValid = true

            setRows.forEach(setRow => {
                const repsInput = setRow.querySelector(`input[name^="reps-"]`)
                const weightInput = setRow.querySelector(`input[name^="weight-"]`)
                if (!repsInput.value ||
                    (weightInput && weightInput.required && !weightInput.value)) {
                    allSetsValid = false
                    return
                } else {
                    const setData = {
                        reps: repsInput.value,
                    }
                    if (weightInput) {
                        setData.weight = weightInput.value
                    }
                    sets.push(setData)
                }
            })

            if (!allSetsValid) {
                alert('Each set of every exercise should have valid entries.')
                allExercisesValid = false
                return
            }

            exercises.push({
                name: exerciseName,
                type: exerciseType,
                sets: sets,
            })
        })

        if (!allExercisesValid) {
            return
        }

        const workoutData = {
            name: workoutName,
            date: workoutDate,
            exercises: exercises,
        }

        // Remove the old workout from the array
        workouts.splice(index, 1)

        // Insert the updated workout into the workouts array in sorted order
        insertWorkoutInOrder(workoutData, workouts)

        // Save to localStorage
        users[currentUser].workouts = workouts
        localStorage.setItem('users', JSON.stringify(users))

        alert('Workout updated successfully!')
        closeModal()
        // Re-render the workout history
        renderWorkoutHistory()
    }

    function insertWorkoutInOrder(workoutData, workoutsArray) {
        const workoutDate = new Date(workoutData.date)
        let inserted = false

        for (let i = 0; i < workoutsArray.length; i++) {
            const existingWorkoutDate = new Date(workoutsArray[i].date)
            if (workoutDate >= existingWorkoutDate) {
                workoutsArray.splice(i, 0, workoutData)
                inserted = true
                break
            }
        }

        if (!inserted) {
            workoutsArray.push(workoutData)
        }
    }

    function deleteWorkout(index) {
        if (confirm('Are you sure you want to delete this workout?')) {
            workouts.splice(index, 1)
            users[currentUser].workouts = workouts
            localStorage.setItem('users', JSON.stringify(users))
            alert('Workout deleted successfully.')
            // Re-render the workout history
            renderWorkoutHistory()
        }
    }

    function closeModal() {
        modalOverlay.style.display = 'none'
        document.body.classList.remove('modal-open')
    }

    // Event listener for close button
    closeModalButton.addEventListener('click', closeModal)

    // Expose function for use in other scripts (if necessary)
    window.checkEditSaveWorkoutButtonVisibility = checkEditSaveWorkoutButtonVisibility

    // Add Exercise to Form
    function addExerciseToForm(exercise = null, exerciseCountParam = null, container, users, currentUser, mode = 'edit') {
        let exerciseCount = container.dataset.exerciseCount || 0
        exerciseCount = exerciseCountParam || ++exerciseCount
        container.dataset.exerciseCount = exerciseCount

        const exerciseDiv = document.createElement('div')
        exerciseDiv.classList.add('exercise')
        exerciseDiv.dataset.exerciseId = exerciseCount

        exerciseDiv.innerHTML = `
            <div class="remove-exercise-button">&times;</div>
            <div class="form-group">
                <label for="exercise-name-${exerciseCount}">Exercise Name</label>
                <input type="text" id="exercise-name-${exerciseCount}" name="exercise-name-${exerciseCount}" required>
            </div>
            <div class="form-group">
                <label for="exercise-type-${exerciseCount}">Exercise Type</label>
                <select id="exercise-type-${exerciseCount}" name="exercise-type-${exerciseCount}" required>
                    <option value="">(select one)</option>
                    <option value="bodyweight">Bodyweight</option>
                    <option value="resistance-band">Resistance Band</option>
                    <option value="weighted">Weighted</option>
                </select>
            </div>
            <div class="sets-container" data-exercise-id="${exerciseCount}">
                <!-- Sets will be added here dynamically -->
            </div>
            <div class="exercise-buttons">
                <button type="button" class="add-set-button btn-secondary">Add Set</button>
            </div>
        `

        container.appendChild(exerciseDiv)

        const removeExerciseButton = exerciseDiv.querySelector('.remove-exercise-button')
        const addSetButton = exerciseDiv.querySelector('.add-set-button')
        const exerciseTypeSelect = exerciseDiv.querySelector(`#exercise-type-${exerciseCount}`)

        const exerciseNameInput = exerciseDiv.querySelector(`#exercise-name-${exerciseCount}`)

        if (mode === 'edit') {
            // Add event listener for exercise name input to show suggestions (if needed)
        }

        exerciseTypeSelect.addEventListener('change', () => {
            changeExerciseType(exerciseDiv, exerciseTypeSelect)
        })

        removeExerciseButton.addEventListener('click', () => {
            container.removeChild(exerciseDiv)
            checkEditSaveWorkoutButtonVisibility()
        })

        addSetButton.addEventListener('click', () => addSet(exerciseDiv))

        // Populate existing exercise data if provided
        if (exercise) {
            exerciseNameInput.value = exercise.name
            exerciseTypeSelect.value = exercise.type
            changeExerciseType(exerciseDiv, exerciseTypeSelect)

            exercise.sets.forEach(set => {
                addSet(exerciseDiv, set)
            })
        }

        checkEditSaveWorkoutButtonVisibility()
    }

    function addSet(exerciseDiv, setData = null) {
        const exerciseId = exerciseDiv.dataset.exerciseId
        const exerciseTypeSelect = exerciseDiv.querySelector(`#exercise-type-${exerciseId}`)

        if (exerciseTypeSelect.value === '') {
            alert('Please select an exercise type.')
            return
        }

        const setsContainer = exerciseDiv.querySelector('.sets-container')
        const currentSetCount = setsContainer.children.length + 1

        const setRow = document.createElement('div')
        setRow.dataset.setNumber = currentSetCount
        setRow.classList.add('set-row')

        let weightInputHTML = ''
        if (exerciseTypeSelect.value === 'resistance-band' || exerciseTypeSelect.value === 'weighted') {
            weightInputHTML = `
                <input
                    type="number"
                    name="weight-${exerciseId}-${currentSetCount}"
                    placeholder="Weight"
                    required>
            `
        }

        setRow.innerHTML = `
            <span class="set-number">${currentSetCount}</span>
            <input
                type="number"
                name="reps-${exerciseId}-${currentSetCount}"
                placeholder="Reps"
                required
            >
            ${weightInputHTML}
            <span class="remove-set-button">&times;</span>
        `

        setsContainer.appendChild(setRow)

        const removeSetButton = setRow.querySelector('.remove-set-button')
        removeSetButton.addEventListener('click', () => {
            removeSet(exerciseDiv, setRow)
        })

        // Populate existing set data if provided
        if (setData) {
            const repsInput = setRow.querySelector(`input[name="reps-${exerciseId}-${currentSetCount}"]`)
            repsInput.value = setData.reps
            if (setData.weight) {
                const weightInput = setRow.querySelector(`input[name="weight-${exerciseId}-${currentSetCount}"]`)
                if (weightInput) {
                    weightInput.value = setData.weight
                }
            }
        }

        checkEditSaveWorkoutButtonVisibility()
    }

    function removeSet(exerciseDiv, setRow) {
        const setsContainer = exerciseDiv.querySelector('.sets-container')
        setsContainer.removeChild(setRow)

        // Adjust set numbers after removal
        const setRows = setsContainer.querySelectorAll('.set-row')
        setRows.forEach((row, index) => {
            const setNumber = index + 1
            row.dataset.setNumber = setNumber
            row.querySelector('.set-number').textContent = setNumber
            const exerciseId = exerciseDiv.dataset.exerciseId
            const repsInput = row.querySelector(`input[name^="reps-"]`)
            const weightInput = row.querySelector(`input[name^="weight-"]`)
            repsInput.name = `reps-${exerciseId}-${setNumber}`
            if (weightInput) {
                weightInput.name = `weight-${exerciseId}-${setNumber}`
            }
        })

        checkEditSaveWorkoutButtonVisibility()
    }

    function changeExerciseType(exerciseDiv, exerciseTypeSelect) {
        const exerciseType = exerciseTypeSelect.value
        const setsContainer = exerciseDiv.querySelector('.sets-container')
        const setRows = setsContainer.querySelectorAll('.set-row')

        setRows.forEach(setRow => {
            const exerciseId = exerciseDiv.dataset.exerciseId
            const setNumber = setRow.dataset.setNumber
            let weightInput = setRow.querySelector(`input[name="weight-${exerciseId}-${setNumber}"]`)

            if (exerciseType === 'resistance-band' || exerciseType === 'weighted') {
                if (!weightInput) {
                    // Add weight input
                    weightInput = document.createElement('input')
                    weightInput.type = 'number'
                    weightInput.name = `weight-${exerciseId}-${setNumber}`
                    weightInput.placeholder = 'Weight'
                    weightInput.required = true

                    const repsInput = setRow.querySelector(`input[name="reps-${exerciseId}-${setNumber}"]`)
                    setRow.insertBefore(weightInput, repsInput.nextSibling)
                }
            } else {
                if (weightInput) {
                    // Remove weight input
                    weightInput.parentNode.removeChild(weightInput)
                }
            }
        })
    }

    // Initial render
    renderWorkoutHistory()
})