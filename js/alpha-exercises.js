(() => {
  const LIBRARY_ADDITIONS = {
    wall_pushup: {
      name: 'Wall Push-Up', image: 'assets/exercises/pushup.svg', kind: 'reps', unit: 'reps',
      muscles: ['chest', 'triceps', 'core'], rest: 60, bodyweight: true, equipment: 'none', pattern: 'push',
      description: 'Stand facing a wall, place your hands around chest height, lower your chest toward the wall, then press away while keeping your body straight.',
      cues: ['Keep ribs and hips stacked', 'Let elbows travel slightly down and back', 'Stop before the shoulders roll forward']
    },
    split_squat_chair: {
      name: 'Split Squat to Chair', image: 'assets/exercises/chair_stand.svg', kind: 'reps', unit: 'reps/side',
      muscles: ['quads', 'glutes', 'core'], rest: 90, bodyweight: true, equipment: 'none', pattern: 'squat',
      description: 'Use a chair for balance and depth guidance. Lower straight down in a staggered stance, lightly touch the chair if needed, and stand through the front leg.',
      cues: ['Keep the front foot fully planted', 'Use the chair for balance, not to pull yourself up', 'Work only through a comfortable range']
    },
    march_in_place: {
      name: 'March in Place', image: 'assets/exercises/march.svg', kind: 'timed', unit: 'seconds',
      muscles: ['cardio', 'legs', 'balance'], rest: 45, bodyweight: true, equipment: 'none', pattern: 'cardio',
      description: 'March continuously at a sustainable pace while lifting each knee to a repeatable height.',
      timing: 'Continue until the countdown ends. Keep the same knee height and pace; slow down rather than letting form collapse.',
      cues: ['Stand tall', 'Land softly', 'Use a wall or chair if balance is uncertain']
    },
    dumbbell_floor_press: {
      name: 'Dumbbell Floor Press', image: 'assets/exercises/chest_press.svg', kind: 'weighted_pair', unit: 'lb each',
      muscles: ['chest', 'triceps'], rest: 120, equipment: 'home', pattern: 'push',
      description: 'Lie on the floor with a dumbbell in each hand. Lower until the upper arms gently contact the floor, pause, then press the weights over the chest.',
      cues: ['Keep wrists stacked over elbows', 'Pause softly on the floor', 'Do not bounce the arms off the ground']
    },
    goblet_squat_chair: {
      name: 'Goblet Squat to Chair', image: 'assets/exercises/chair_stand.svg', kind: 'weighted', unit: 'lb',
      muscles: ['quads', 'glutes', 'core'], rest: 120, equipment: 'home', pattern: 'squat',
      description: 'Hold one weight at chest height, sit back toward a sturdy chair, touch lightly, and stand without rocking.',
      cues: ['Keep the weight close to the chest', 'Keep knees tracking with toes', 'Use the chair as a depth target, not a rest']
    },
    one_arm_row: {
      name: 'One-Arm Row', image: 'assets/exercises/seated_row.svg', kind: 'weighted', unit: 'lb / reps/side',
      muscles: ['back', 'biceps', 'core'], rest: 90, equipment: 'home', pattern: 'pull',
      description: 'Support one hand on a bench or chair, brace the torso, and pull the weight toward the hip before lowering under control.',
      cues: ['Keep shoulders away from ears', 'Pull toward the hip, not the chest', 'Avoid twisting the torso']
    },
    band_pulldown: {
      name: 'Band Pulldown', image: 'assets/exercises/lat_pulldown.svg', kind: 'reps', unit: 'reps',
      muscles: ['back', 'biceps'], rest: 75, equipment: 'home', pattern: 'pull',
      description: 'Anchor a resistance band overhead and pull the elbows down toward the ribs, then return slowly.',
      cues: ['Keep the chest tall', 'Drive elbows down', 'Control the return instead of letting the band snap back']
    },
    dumbbell_rdl: {
      name: 'Dumbbell Romanian Deadlift', image: 'assets/exercises/leg_curl.svg', kind: 'weighted_pair', unit: 'lb each',
      muscles: ['hamstrings', 'glutes', 'back'], rest: 120, equipment: 'home', pattern: 'hinge',
      description: 'Hold the weights at your sides, push the hips backward with soft knees, and stand by driving the hips forward.',
      cues: ['Keep weights close to the legs', 'Stop when the hamstrings limit the range', 'Keep the spine long and steady']
    }
  };

  const ENRICHMENTS = {
    brisk_walk: { equipment: 'none', pattern: 'cardio', description: 'Walk at a pace that raises your breathing while still allowing short sentences.', timing: 'Continue until the countdown ends. Maintain a purposeful but sustainable pace.', cues: ['Stand tall', 'Use a natural arm swing', 'Shorten the stride if joints feel irritated'] },
    easy_row: { equipment: 'gym', pattern: 'cardio', description: 'Row smoothly at an easy aerobic pace with consistent strokes.', timing: 'Continue until the countdown ends. This is steady work, not a maximum-effort test.', cues: ['Push with the legs first', 'Keep the handle path level', 'Relax the shoulders on recovery'] },
    row_interval: { equipment: 'gym', pattern: 'cardio', description: 'Complete the prescribed distance with strong, repeatable strokes.', timing: 'The set ends when the target distance is reached. Record the elapsed time.', cues: ['Drive with the legs', 'Keep strokes repeatable', 'Do not sprint the first quarter'] },
    row_2k: { equipment: 'gym', pattern: 'cardio', description: 'Row 2,000 meters continuously and record the finishing time.', timing: 'The timer counts upward until 2,000 meters is complete. Pace evenly enough to preserve form.', cues: ['Start controlled', 'Keep the stroke sequence consistent', 'Finish hard only if technique remains clean'] },
    pushup: { equipment: 'none', pattern: 'push', description: 'Lower the body as one unit until the elbows reach roughly 90 degrees, then press back to the start.', cues: ['Brace the core', 'Keep head, ribs, and hips aligned', 'Stop when the body line or depth can no longer be maintained'] },
    incline_pushup: { equipment: 'none', pattern: 'push', description: 'Place hands on a stable raised surface and perform a push-up while keeping the body straight.', cues: ['Choose a height that permits clean reps', 'Keep elbows slightly tucked', 'Move the chest toward the support'] },
    plank: { equipment: 'none', pattern: 'core', description: 'Hold a forearm plank with a straight line from shoulders through hips.', timing: 'Hold until the countdown ends. For a max hold, stop the timer when clean position can no longer be restored immediately.', cues: ['Squeeze glutes lightly', 'Keep ribs down', 'End the set before lower-back pain'] },
    side_plank: { equipment: 'none', pattern: 'core', description: 'Support the body on one forearm and the side of the feet or knees while lifting the hips.', timing: 'Hold the position until the countdown ends, then repeat on the other side.', cues: ['Stack the shoulders', 'Keep hips lifted', 'Use the knee-supported version when needed'] },
    dead_bug: { equipment: 'none', pattern: 'core', description: 'Lie on your back and slowly lower opposite arm and leg while keeping the trunk steady.', cues: ['Keep the lower back gently supported', 'Move slowly', 'Reduce range if the back arches'] },
    bird_dog: { equipment: 'none', pattern: 'core', description: 'From hands and knees, reach opposite arm and leg while keeping the torso still.', cues: ['Keep hips square', 'Reach long rather than high', 'Pause briefly without twisting'] },
    chair_stand: { equipment: 'none', pattern: 'squat', description: 'Stand fully from a sturdy chair and sit back under control without using the hands when possible.', timing: 'For a timed test, complete as many clean full stands as possible before time expires.', cues: ['Place the chair against a wall', 'Keep feet planted', 'Control the return to the chair'] },
    wall_sit: { equipment: 'none', pattern: 'squat', description: 'Slide down a wall into a comfortable seated position and hold.', timing: 'Hold until the countdown ends or stop the timer when posture or knee comfort can no longer be maintained.', cues: ['Keep feet flat', 'Choose a pain-free depth', 'Keep the back supported by the wall'] },
    single_leg_balance: { equipment: 'none', pattern: 'balance', description: 'Stand on one foot near a stable support and hold a steady position.', timing: 'Hold until time expires or stop when the raised foot touches down. Repeat on the other side.', cues: ['Keep a support within reach', 'Focus on one fixed point', 'Use fingertip support when needed'] },
    march_2m: { equipment: 'none', pattern: 'cardio', description: 'March continuously in place while counting right-knee raises.', timing: 'Continue for exactly two minutes. Keep the target knee height consistent and record the final count.', cues: ['Stand tall', 'Use a repeatable knee height', 'Slow down rather than losing balance'] },
    bodyweight_calf_raise: { equipment: 'none', pattern: 'calves', description: 'Rise onto the balls of the feet, pause, and lower under control.', cues: ['Use light support for balance', 'Move through a comfortable range', 'Avoid bouncing'] },
    chest_press: { equipment: 'gym', pattern: 'push', description: 'Press the machine handles forward from chest height and return under control.', cues: ['Adjust the seat so handles begin near mid-chest', 'Keep shoulders against the pad', 'Do not lock the elbows aggressively'] },
    seated_row: { equipment: 'gym', pattern: 'pull', description: 'Pull the cable handle toward the lower ribs, then reach forward under control.', cues: ['Keep the torso mostly still', 'Pull elbows behind the body', 'Do not shrug'] },
    lat_pulldown: { equipment: 'gym', pattern: 'pull', description: 'Pull the bar toward the upper chest while keeping the torso tall.', cues: ['Drive elbows down', 'Avoid leaning far backward', 'Control the bar overhead'] },
    leg_press: { equipment: 'gym', pattern: 'squat', description: 'Lower the sled through a comfortable range and press it away with the whole foot.', cues: ['Keep the low back against the pad', 'Keep knees aligned with toes', 'Do not lock the knees hard'] },
    leg_curl: { equipment: 'gym', pattern: 'hinge', description: 'Curl the pad by bending the knees, pause, and return slowly.', cues: ['Align the machine pivot with the knee', 'Keep hips against the seat', 'Use a controlled return'] },
    leg_extension: { equipment: 'gym', pattern: 'squat', description: 'Extend the knees to raise the pad, pause, and lower smoothly.', cues: ['Align the machine pivot with the knee', 'Avoid kicking the weight', 'Use a comfortable range'] },
    face_pull: { equipment: 'gym', pattern: 'pull', description: 'Pull the rope toward the face with elbows high, separating the hands at the finish.', cues: ['Keep ribs down', 'Pull toward eye level', 'Pause with shoulder blades controlled'] },
    shoulder_press: { equipment: 'home', pattern: 'push', description: 'Press dumbbells overhead from shoulder height and lower with control.', cues: ['Keep ribs stacked', 'Press without shrugging', 'Use a pain-free path'] },
    farmer_carry: { equipment: 'home', pattern: 'carry', description: 'Walk while holding weights at the sides and maintaining tall posture.', timing: 'Walk until the countdown ends. Stop early if grip opens or posture collapses.', cues: ['Stand tall', 'Take controlled steps', 'Keep weights from swinging'] },
    step_up: { equipment: 'home', pattern: 'squat', description: 'Step onto a stable platform, stand fully, and lower under control.', cues: ['Use a stable height', 'Drive through the working foot', 'Avoid pushing excessively from the trailing leg'] },
    calf_raise: { equipment: 'gym', pattern: 'calves', description: 'Raise the heels through a comfortable range, pause, and lower slowly.', cues: ['Keep pressure through the big toe and second toe', 'Avoid bouncing', 'Use the full comfortable range'] },
    pallof: { equipment: 'gym', pattern: 'core', description: 'Hold a cable or band at the chest and press it forward without allowing the torso to rotate.', cues: ['Keep hips and shoulders square', 'Exhale as the hands move away', 'Use a load that permits stillness'] }
  };

  Object.assign(window.SF_DATA.exercises, LIBRARY_ADDITIONS);
  Object.entries(ENRICHMENTS).forEach(([id, details]) => {
    if (window.SF_DATA.exercises[id]) Object.assign(window.SF_DATA.exercises[id], details);
  });
})();
