window.SF_DATA = (() => {
  'use strict';

  const xpThresholds = [
    0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
    85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
  ];

  const exercises = {
    brisk_walk: { name: 'Brisk Walk', image: 'assets/exercises/walk.svg', kind: 'timed', unit: 'minutes', muscles: ['cardio', 'legs'], rest: 0 },
    easy_row: { name: 'Easy Row', image: 'assets/exercises/rower.svg', kind: 'timed', unit: 'minutes', muscles: ['cardio', 'back', 'legs', 'core'], rest: 60 },
    row_interval: { name: 'Row Interval', image: 'assets/exercises/rower.svg', kind: 'timed', unit: 'meters', muscles: ['cardio', 'back', 'legs', 'core'], rest: 90 },
    row_2k: { name: '2,000 m Row', image: 'assets/exercises/rower.svg', kind: 'test', unit: 'time', muscles: ['cardio', 'back', 'legs', 'core'], rest: 300 },
    pushup: { name: 'Assessment Push-Up', image: 'assets/exercises/pushup.svg', kind: 'reps', unit: 'reps', muscles: ['chest', 'triceps', 'core'], rest: 90, bodyweight: true },
    incline_pushup: { name: 'Incline Push-Up', image: 'assets/exercises/pushup.svg', kind: 'reps', unit: 'reps', muscles: ['chest', 'triceps', 'core'], rest: 75, bodyweight: true },
    plank: { name: 'Forearm Plank', image: 'assets/exercises/plank.svg', kind: 'timed', unit: 'seconds', muscles: ['core', 'back'], rest: 90, bodyweight: true },
    side_plank: { name: 'Side Plank', image: 'assets/exercises/side_plank.svg', kind: 'timed', unit: 'seconds/side', muscles: ['core'], rest: 60, bodyweight: true },
    dead_bug: { name: 'Dead Bug', image: 'assets/exercises/dead_bug.svg', kind: 'reps', unit: 'reps/side', muscles: ['core'], rest: 45, bodyweight: true },
    bird_dog: { name: 'Bird Dog', image: 'assets/exercises/bird_dog.svg', kind: 'reps', unit: 'reps/side', muscles: ['core', 'back'], rest: 45, bodyweight: true },
    chair_stand: { name: '30-Second Chair Stand', image: 'assets/exercises/chair_stand.svg', kind: 'reps', unit: 'reps', muscles: ['quads', 'glutes', 'core'], rest: 120, bodyweight: true },
    wall_sit: { name: 'Wall Sit', image: 'assets/exercises/wall_sit.svg', kind: 'timed', unit: 'seconds', muscles: ['quads', 'glutes', 'core'], rest: 120, bodyweight: true },
    single_leg_balance: { name: 'Single-Leg Balance', image: 'assets/exercises/balance.svg', kind: 'timed', unit: 'seconds/side', muscles: ['balance', 'ankles', 'core'], rest: 45, bodyweight: true },
    march_2m: { name: '2-Minute March in Place', image: 'assets/exercises/march.svg', kind: 'reps', unit: 'right-knee raises', muscles: ['cardio', 'legs', 'balance'], rest: 180, bodyweight: true },
    bodyweight_calf_raise: { name: 'Standing Calf Raise', image: 'assets/exercises/calf_raise.svg', kind: 'reps', unit: 'reps', muscles: ['calves', 'balance'], rest: 75, bodyweight: true },
    chest_press: { name: 'Machine Chest Press', image: 'assets/exercises/chest_press.svg', kind: 'weighted', unit: 'lb', muscles: ['chest', 'triceps'], rest: 120 },
    seated_row: { name: 'Seated Cable Row', image: 'assets/exercises/seated_row.svg', kind: 'weighted', unit: 'lb', muscles: ['back', 'biceps'], rest: 120 },
    lat_pulldown: { name: 'Lat Pulldown', image: 'assets/exercises/lat_pulldown.svg', kind: 'weighted', unit: 'lb', muscles: ['back', 'biceps'], rest: 105 },
    leg_press: { name: 'Leg Press', image: 'assets/exercises/leg_press.svg', kind: 'weighted', unit: 'lb', muscles: ['quads', 'glutes'], rest: 150 },
    leg_curl: { name: 'Seated Leg Curl', image: 'assets/exercises/leg_curl.svg', kind: 'weighted', unit: 'lb', muscles: ['hamstrings'], rest: 90 },
    leg_extension: { name: 'Leg Extension', image: 'assets/exercises/leg_extension.svg', kind: 'weighted', unit: 'lb', muscles: ['quads'], rest: 90 },
    face_pull: { name: 'Cable Face Pull', image: 'assets/exercises/face_pull.svg', kind: 'weighted', unit: 'lb', muscles: ['upper back', 'shoulders'], rest: 75 },
    shoulder_press: { name: 'Seated Dumbbell Press', image: 'assets/exercises/shoulder_press.svg', kind: 'weighted_pair', unit: 'lb each', muscles: ['shoulders', 'triceps'], rest: 120 },
    farmer_carry: { name: 'Dumbbell Farmer Carry', image: 'assets/exercises/farmer_carry.svg', kind: 'weighted_timed', unit: 'lb each / sec', muscles: ['grip', 'core', 'legs'], rest: 90 },
    step_up: { name: 'Step-Up', image: 'assets/exercises/step_up.svg', kind: 'weighted', unit: 'lb / reps', muscles: ['quads', 'glutes'], rest: 90 },
    calf_raise: { name: 'Machine Calf Raise', image: 'assets/exercises/calf_raise.svg', kind: 'weighted', unit: 'lb', muscles: ['calves'], rest: 75 },
    pallof: { name: 'Pallof Press', image: 'assets/exercises/pallof.svg', kind: 'weighted', unit: 'lb / reps/side', muscles: ['core'], rest: 60 }
  };

  return { xpThresholds, exercises };
})();
