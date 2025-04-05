/* 
 * Optimized Add Keyframes to All Bones Plugin
 * Plugin ID: optimized_add_keyfames_to_all_bones
 * 
 * This plugin adds a button to the animation timeline that, when clicked,
 * creates keyframes for position, rotation, and scale for every visible bone
 * at the current timeline time—even if no previous keyframe exists.
 *
 * Instructions:
 *   1. Save this code into a file named "optimized_add_keyfames_to_all_bones.js".
 *   2. In Blockbench, go to Plugins > Install Plugin from File… and select the file.
 *   3. The new action will be available in the Animation menu and can also be added
 *      to your timeline shortcut buttons.
 */

Plugin.register('optimized_add_keyfames_to_all_bones', {
    title: 'Optimized Add Keyframes to All Bones',
    author: 'ChatGPT',
    description: 'Adds keyframes for position, rotation, and scale for all visible bones at the current timeline time.',
    icon: 'fa-plus-circle',
    version: '1.0.0',
    variant: 'both',
    
    onload() {
        // Register an action available in the Animation menu/timeline
        new Action('optimized_add_keyframe_all_bones', {
            name: 'Add Keyframe to All Visible Bones',
            description: 'Adds keyframes to all visible bones at the current timeline position.',
            icon: 'fa-plus-circle',
            click: function() {
                // Check if an animation is selected
                if (!Animation.selected) {
                    Blockbench.showQuickMessage('No animation selected!', 2000);
                    return;
                }

                // Get the current timeline time
                let timelineTime = Timeline.time;

                // Retrieve the animators from the timeline (each representing a bone/track)
                let animators = Timeline.animators || [];
                if (animators.length === 0) {
                    Blockbench.showQuickMessage('No animators found in the timeline.', 2000);
                    return;
                }

                // Save the current timeline scroll position to prevent unwanted scrolling
                let timelineContainer = document.querySelector('.timeline_container') || document.querySelector('.timeline');
                let scrollPos = timelineContainer ? timelineContainer.scrollTop : 0;

                // Begin an Undo group so the action can be reversed
                Undo.initEdit({keyframes: []});
                let addedKeyframes = 0;

                // Process each animator (i.e. bone) if it is visible
                animators.forEach(animator => {
                    if (animator.hidden) return; // Skip hidden bones

                    // For each channel: position, rotation, and scale, create a keyframe
                    ['position', 'rotation', 'scale'].forEach(channel => {
                        if (animator[channel]) {
                            // The fourth parameter (true) forces creation of a keyframe by duplicating previous values if necessary.
                            let kf = animator.createKeyframe(null, timelineTime, channel, true);
                            if (kf) {
                                Timeline.selected.push(kf);
                                kf.selected = true;
                                addedKeyframes++;
                            }
                        }
                    });
                });

                // Finalize the Undo grouping
                Undo.finishEdit('Add keyframes to all visible bones');

                // Update the animation preview
                Animator.preview();

                // Restore the original timeline scroll position
                if (timelineContainer) timelineContainer.scrollTop = scrollPos;

                Blockbench.showQuickMessage(`${addedKeyframes} keyframes added successfully.`, 2000);
            }
        });

        // Add the new action to the Animation menu for easy access.
        MenuBar.addAction(ActionManager.getAction('optimized_add_keyframe_all_bones'), 'animation');
    },
    
    onunload() {
        // Remove the action when the plugin is unloaded
        ActionManager.removeAction('optimized_add_keyframe_all_bones');
    }
});
