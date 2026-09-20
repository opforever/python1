import { PracticeLesson } from '../types';

export const PRACTICE_LESSONS: PracticeLesson[] = [
  {
    id: 'interactive-greeting',
    title: '1. Interactive Input Dialogue',
    category: 'Basics',
    difficulty: 'Beginner',
    description: 'Test interactive user input with input() where you type responses right in the terminal.',
    hint: 'Run this and respond to the live terminal prompts!',
    code: `# Interactive user inputs with input()
# When Python reaches input(), the terminal prompts you directly!

test = input("What is your name? ")
print(f"Hello, {test}! Welcome to your Python sanctuary.")

year_born = input("What year were you born (e.g. 2005)? ")
try:
    age = 2026 - int(year_born)
    print(f"Delightful! You are approximately {age} years young.")
except ValueError:
    print("Numbers can be tricky, but you're doing great!")

calm_place = input("Name a place where you feel most peaceful: ")
print(f"Envisioning the calm serenity of {calm_place} today.")
`
  },
  {
    id: 'hello-world',
    title: '2. Hello, Peaceful World',
    category: 'Basics',
    difficulty: 'Beginner',
    description: 'Your gentle introduction to printing, variables, and modern f-string formatting.',
    hint: 'Try changing the name or the greeting message, then click Run (Ctrl + Enter).',
    code: `# Welcome to your calm Python sanctuary!
# In Python, we use the print() function to show messages.

name = "Aria"
journey_day = 1
favorite_thing = "learning new things"

print("=" * 42)
print("  🌿 Welcome to your Python Journey 🌿")
print("=" * 42)
print(f"Hello, {name}! Today is Day {journey_day}.")
print(f"Goal for today: Enjoy {favorite_thing} without rush.")
print("-" * 42)

# Python can do arithmetic directly:
print("24 hours * 60 minutes =", 24 * 60, "minutes in a peaceful day.")
`
  },
  {
    id: 'decisions',
    title: '3. Serene Decisions (if/elif/else)',
    category: 'Control Flow',
    difficulty: 'Beginner',
    description: 'Teach Python how to make mindful choices using conditional logic.',
    hint: 'Modify the temperature value or water_drank to see different paths execute.',
    code: `# Python uses 'if', 'elif', and 'else' to make decisions.
# Notice the 4 spaces indenting each action block!

temperature = 22  # in Celsius
energy_level = 8  # on a scale from 1 to 10
water_drank_liters = 1.8

print("🌿 Morning Mindful Check-in:")

if temperature < 15:
    print("• It's cool outside. A warm herbal tea sounds delightful.")
elif temperature > 26:
    print("• A sunny warm day! Remember to stay hydrated.")
else:
    print("• Perfect mild weather for a calm walk.")

if energy_level >= 7:
    print("• You have vibrant energy today! Great time to code.")
else:
    print("• Be kind to yourself today. Take gentle breaks.")

if water_drank_liters >= 2.0:
    print("• Hydration goal achieved! ✨")
else:
    remaining = round(2.0 - water_drank_liters, 2)
    print(f"• Sip {remaining}L more water to stay refreshed.")
`
  },
  {
    id: 'looping-patterns',
    title: '4. Pattern of Stars (Loops)',
    category: 'Control Flow',
    difficulty: 'Beginner',
    description: 'Use for-loops and string multiplication to create symmetrical visual art.',
    hint: 'Experiment with changing the symbol or the number of levels (steps).',
    code: `# In Python, you can multiply strings!
# "*" * 3 becomes "***"

steps = 7
symbol = "✿"

print("Generating a serene star lotus pyramid:\n")

for i in range(1, steps + 1):
    # Calculate spacing for balance
    spaces = " " * (steps - i)
    petals = (symbol + " ") * i
    print(spaces + petals)

print("\nLotus bloomed with elegance.")
`
  },
  {
    id: 'lists-data',
    title: '5. Zen Garden Inventory (Lists)',
    category: 'Data Structures',
    difficulty: 'Beginner',
    description: 'Store, sort, append, and slice collections of elements using Python lists.',
    hint: 'Try adding your own item with garden_items.append("Bonsai Tree").',
    code: `# Lists are ordered collections surrounded by square brackets [].

garden_items = ["Smooth River Pebble", "Bamboo Chime", "White Sand", "Moss Stone"]

print("Initial Sanctuary Elements:")
for index, item in enumerate(garden_items, start=1):
    print(f"  {index}. {item}")

# Adding new elements:
garden_items.append("Lotus Blossom")
garden_items.append("Lantern")

# Sorting alphabetically:
garden_items.sort()

print(f"\nExpanded & Organized Garden ({len(garden_items)} items):")
for item in garden_items:
    print(f"  ✓ {item}")

# Slicing the list (taking the first 3):
print("\nTop 3 peaceful highlights:", garden_items[:3])
`
  },
  {
    id: 'random-dice',
    title: '6. Dice & Probability (Standard Library)',
    category: 'Standard Library',
    difficulty: 'Beginner',
    description: 'Use the built-in random and statistics modules to roll dice and find averages.',
    hint: 'Change num_rolls to 1000 and see the average approach 3.5!',
    code: `import random
import statistics

# The random module comes built-in with Python!
num_rolls = 10
rolls = [random.randint(1, 6) for _ in range(num_rolls)]

print(f"🎲 Rolling a 6-sided die {num_rolls} times:")
print("Results:", rolls)

print("\nStatistical Harmony:")
print(f"• Minimum rolled: {min(rolls)}")
print(f"• Maximum rolled: {max(rolls)}")
print(f"• Average (Mean): {statistics.mean(rolls):.2f}")
print(f"• Most frequent (Mode): {statistics.mode(rolls)}")
`
  },
  {
    id: 'fibonacci-functions',
    title: '7. The Golden Fibonacci (Functions)',
    category: 'Functions',
    difficulty: 'Beginner',
    description: 'Define your own reusable function to compute the peaceful Fibonacci spiral.',
    hint: 'Functions start with "def", followed by the name and parameters.',
    code: `def generate_fibonacci(count):
    """Generate a list of Fibonacci numbers up to count."""
    if count <= 0:
        return []
    if count == 1:
        return [0]
    
    sequence = [0, 1]
    while len(sequence) < count:
        next_num = sequence[-1] + sequence[-2]
        sequence.append(next_num)
    return sequence

terms = 12
fib = generate_fibonacci(terms)

print(f"🌀 The First {terms} Fibonacci Numbers found in Nature:")
for i, num in enumerate(fib):
    ratio = f" (Ratio: {num / fib[i-1]:.4f})" if i > 1 and fib[i-1] != 0 else ""
    print(f"  n={i:2d} -> {num:4d}{ratio}")

print("\nNotice how the ratio between numbers approaches 1.618 (The Golden Ratio)!")
`
  },
  {
    id: 'numpy-science',
    title: '8. NumPy Array Math (Scientific Library)',
    category: 'NumPy',
    difficulty: 'Beginner',
    description: 'Explore the renowned NumPy library for fast array mathematics.',
    hint: 'Pyodide loads real NumPy in your browser via WebAssembly!',
    code: `import numpy as np

# Creating NumPy arrays
temperatures_f = np.array([68.0, 72.5, 75.0, 65.2, 70.8])

# Vectorized conversion to Celsius in one line! (No loop required)
temperatures_c = (temperatures_f - 32) * (5 / 9)

print("📊 Temperature Analysis with NumPy:")
print("Fahrenheit:", temperatures_f)
print("Celsius:   ", np.round(temperatures_c, 1))

print("\nCalculations:")
print("• Mean temp (°C):", np.mean(temperatures_c).round(2))
print("• Min temp (°C): ", np.min(temperatures_c).round(2))
print("• Max temp (°C): ", np.max(temperatures_c).round(2))
print("• Std deviation: ", np.std(temperatures_c).round(2))
`
  },
  {
    id: 'matplotlib-waves',
    title: '9. Visual Graphing (Matplotlib)',
    category: 'Plots',
    difficulty: 'Fun Practice',
    description: 'Render beautiful scientific plots and waves with Matplotlib in the Plots tab.',
    hint: 'Matplotlib charts appear directly in your visual output panel!',
    code: `import matplotlib.pyplot as plt
import numpy as np

# Create smooth data points
x = np.linspace(0, 4 * np.pi, 250)
y1 = np.sin(x)
y2 = np.cos(x) * 0.7

plt.figure(figsize=(7, 3.8), facecolor='#090d12')
ax = plt.axes()
ax.set_facecolor('#0d1217')

plt.plot(x, y1, color='#10b981', linewidth=2.5, label='Sine Harmony')
plt.plot(x, y2, color='#38bdf8', linewidth=2, linestyle='--', label='Cosine Flow')

plt.title('Calm Harmonic Oscillations', color='#e2e8f0', fontsize=12, pad=12)
plt.xlabel('Time (t)', color='#94a3b8')
plt.ylabel('Amplitude', color='#94a3b8')
plt.tick_params(colors='#64748b')
plt.grid(True, linestyle=':', alpha=0.3, color='#475569')
plt.legend(facecolor='#1e293b', edgecolor='#334155', labelcolor='#e2e8f0')

print("Generating visual graph... Check the Plots tab!")
plt.show()
`
  }
];
