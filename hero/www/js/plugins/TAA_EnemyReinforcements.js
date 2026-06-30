//=============================================================================
// TAA_EnemyReinforcements.js
// Author: taaspider
//=============================================================================

var TAA = TAA || {};
TAA.enr = {};
TAA.enr.Version = "1.2.2";
TAA.enr.PluginName = "TAA_EnemyReinforcements";
TAA.enr.alias = {};
var Imported = Imported || {};

/*: 
 * @target MV MZ
 *
 * @plugindesc [1.2.2] Allow enemies to summon reinforcements
 * @author T. A. A. (taaspider)
 * @url https://www.patreon.com/taaspider
 * 
 * @help
 * =============================================================================
 * Terms of Use
 * =============================================================================
 * 
 * This plugin was developed by taaspider and is free for both commercial and
 * noncommercial use. You're free to edit to suit your game's needs, as long as I'm
 * credited for the original version. You're not allowed to reuse and sell
 * part or the whole of this plugin without prior written consent from the author.
 * Also, let me know when you publish your game so I can check it out!
 * 
 * If you like and want to support me, check out my facebook page and become
 * my patron:
 *  Facebook: https://www.facebook.com/taaspider 
 *  Patreon: https://www.patreon.com/taaspider
 *  
 * =============================================================================
 * Introduction
 * =============================================================================
 * 
 * WARNING: This plugin requires RPG Maker MV 1.5.0 or above! Please make sure 
 * your RPG Maker MV software is up to date before using this plugin.
 * 
 * -----------------------------------------------------------------------------
 * 
 * This plugin aims to provide a flexible way for you to create skills or in
 * battle cutscenes where enemy reinforcements are called to the battlefield.
 * In this way, for example, you could design a certain type of enemy specialized 
 * in summoning his minions to do the fighting for him, or have a boss call
 * for help when he retreats to prepare the next big attack and heal himself.
 * 
 * To make it possible and easy to use, we have to know beforehand coordinates 
 * where we can place our enemy sprites in the screen, so that you as the dev 
 * doesn't need to be that precise every time a reinforcement is called. With 
 * this in mind, this plugin builds reinforcement slots, which identify specific 
 * positions that reinforcements are expected to pop up if called, which can be 
 * customized for each troop, if you don't want to always use the default slots 
 * configurable in the Plugin Manager.
 * 
 * 
 * =============================================================================
 * Parameters
 * =============================================================================
 * 
 * Although there isn't many configurable parameters, those are important to
 * determine how calling a reinforcement will work. We'll go through each one
 * of them below.
 * 
 * Enable Self State
 *  This parameter determines if enemy positions in the current troop will be
 *  considered as a reinforcement slot when said enemy is defeated. This means
 *  that when it goes, another enemy can be summoned to take its place, which
 *  can happen any number of times until the one calling for reinforcements is
 *  defeated.
 * 
 * Play Summon Animation
 *  This parameter determines if an animation is going to be played over the new
 *  enemy whenever it is summoned as reinforcement into battle.
 * 
 * Summon Animation
 *  This specifies which animation to play if the previous parameter is enabled.
 * 
 * Entrance Delay
 *  This specify a number of frames to wait before the enemy start to appear
 *  on the battlefield after the summoning starts. This is a useful parameter
 *  when you want to time it just right to your selected summon animation.
 * 
 * Entrance Type
 *  This defines how the reinforcement will move into the battlefield. The 
 *  current supported options are as follows:
 *      - Enter from Spot: Enemy start to appear from a few pixels below its
 *        target position, alternating from full transparency to full opacity
 *        as it moves;
 *      - Enter from Left: Enemy start to appear from the left of screen, sliding
 *        into position, alternating from full transparency to full opacity as
 *        it moves;
 *      - Enter from Above: Enemy start to appear from above of the screen, sliding
 *        into position, alternating from full transparency to full opacity as
 *        it moves;
 *      - Enter from Right: Enemy start to appear from the right ot the screen, sliding
 *        into position, alternating from full transparency to full opacity as
 *        it moves;
 *      - Enter from Below: Enemy start to appear from below the screen, sliding
 *        into position, alternating from full transparency to full opacity as
 *        it moves;
 *      - None: Enemy simply appears already into its target coordinates, alternating
 *        from full transparency to full opacity as it moves;
 *  IMPORTANT: As the animation is played considering the enemy's position, selecting
 *  anything other than None with animations enabled will cause the animation to follow
 *  the enemy sprite in the screen as it moves. That is sadly a plugin limitation.
 * 
 * Entrance Duration
 *  Defines the number of frames it takes for the enemy sprite to alternate from
 *  full transparency to full opacity. If you want the enemy reinforcement to just
 *  popup into the battlefield simply set this to zero.
 * 
 * Enable Battle Logs
 *  Enable or disable reinforcement specific battle logs.
 * 
 * Single Summon Message
 *  Message displayed at the battle log when any number of a single enemy Id is 
 *  called. Use %1 to substitute for the number of summons, and %2 for enemy name.
 * 
 * Auto Plural
 *  If enabled, the plugin will automatically add an 's' at the end of the enemy
 *  name when more than one unit is summoned. It has its limitations, but should
 *  work most of the time for games in english.
 * 
 * Multi-Summon Message
 *  Defines a single generic message to be displayed when multiple enemy Ids are
 *  summoned at the same time.
 * 
 * Failed Summon Message
 *  Defines the message to display at the battle logs when a summon fails, be it
 *  due to not having reinforcement slots available or any other reason.
 * 
 * ============================================================================
 * Note Tags
 * ============================================================================
 * 
 * Note tags can be applied to troops to customize reinforcement slots. For that,
 * include them as commentaries into the troop's first page (regardless of how many
 * pages you have setup).
 * 
 * You can carefully set each slot position through its x and y coordinates,
 * either as a single tag or as a collection of coordinates inside enclosing tags.
 *  <TAA_ER: x1,y1; x2,y2; ... xn,yn>
 *      or
 *  <TAA_ER>
 *  x1,y1
 *  x2,y2; x3,y3
 *  ...
 *  xn,yn
 *  </TAA_ER>
 * 
 * You can load slots from enemies position on another troop:
 *  <TAA_ER: TROOP x>
 *      or
 *  <TAA_ER>
 *  TROOP x
 *  TROOP y
 *  </TAA_ER>
 * 
 * You can enable or disable self as reinforcement individually for each
 * troop using the following tags:
 *  <TAA_ER: Self on>
 *  <TAA_ER: Self off>
 *      or
 *  <TAA_ER>
 *  Self on|off
 *  </TAA_ER>
 * 
 * You can also mix and match tags using both the single line and multiline tags.
 * Just separate each command with a semicolon (;):
 *  <TAA_ER: x1,y1; TROOP n;Self off>
 *      or
 *  <TAA_ER>
 *  x1,y1
 *  TROOP n
 *  self on
 *  x2,y2;TROOP n2
 *  </TAA_ER>
 * 
 * 
 * Finally, you can add note tags to skills to make it call for reinforcements.
 * Be advised though, that calling for reinforcements without any available slots
 * will result in, well, nothing. Also, this tag only applies for enemies calling
 * for reinforcement. You can have an actor with the same skill, but using it
 * will still summon troop reinforcement. The plugin cannot be used to summon
 * new allies.
 * 
 * To make a skill call for reinforcements, use the following note tags:
 *  <TAA_ER: id1,n1;id2,n2; ... idn,nn>
 *      or
 *  <TAA_ER>
 *  id1,n1
 *  id2,n2
 *  ...
 *  idn,nn
 *  </TAA_ER>
 * 
 * "id" is the enemy id you want to summon, while n is the number of enemies to 
 * summon (so you can have a skill that calls one bat, and another that calls two,
 * for example). You can have as many enemies listed as you want, just remember
 * that reinforcements will be summoned as long as there are slots available.
 * For instance, if you create a skill that calls 3 bats, and the current troop
 * has only two available slots, only two bats are summoned. Every other summon
 * listed for the skill after that will result in nothing. Likewise, if player
 * party kill one of the enemies clearing one slot, that means the next time the
 * skill is used only the first enemy listed on the tag will be summoned and
 * so forth.
 * 
 * Still on skill note tags, you can also add additional notes to define how likely
 * a reinforcement call is to succeed, or a specific level / level range the summoned
 * reinforcement is going to have (YEP_EnemyLevels or TAA_EnemyLevels is needed for 
 * this feature):
 * 
 * <TAA_ER: id1,n1,rX,lvY;id2,n2,lvY2:W2>
 *      or
 * <TAA_ER>
 * id1,n1,rX,lvY
 * id2,n2,lvY2:W2
 * ...
 * </TAA_ER>
 * 
 * To add randomness to a reinforcement call, set the tag with the enemy id to
 * be summoned, the number of times it will happen, and then add another comma
 * followed by the letter 'r' and the probability of the summoning succeeding, in
 * a number between 0 and 100 (the higher the number, the most likely it is to
 * succeed). For example: <TAA_ER: 1,1,r85>
 * 
 * If the summon specifies more than one summon for a given enemy the probability 
 * will be applied for each individual summon. Take the example below:
 *      <TAA_ER: 1,2,r85>
 * Enemy 1 will be summoned two times, and each time has 85% chance of succeeding.
 * That means the skill can summon from zero to two enemy reinforcements.
 * 
 * To define levels for the summoned enemies, add the letters 'lv' followed by the
 * specific level wanted, or a level range separated by ':'. Here's some examples:
 *      <TAA_ER: 1,1,lv10>
 *      <TAA_ER: 2,1,lv2:5>
 *      <TAA_ER: 5,2,r87,lv5>
 *      <TAA_ER: 1,2,lv8,r95>
 * 
 * Random and Level clauses can appear in any order, as long as the id and number
 * of summons comes first.
 * 
 * ============================================================================
 * Compatibility Warnings
 * ============================================================================
 * 
 * TAA_SkillMastery
 *  Both scripts are compatible, just make sure EnemyReinforcements is placed AFTER
 *  SkillMastery in the plugin list.
 * 
 * ============================================================================
 * Script Calls
 * ============================================================================
 * 
 * The following script calls are available:
 * 
 * $enrConfig.selfAsReinforcement()
 *  Returns true if the option to turn each enemy position on the current troop
 *  available for a reinforcement (after the original enemy is killed). Returns 
 *  false otherwise.
 * 
 * $enrConfig.enableSelfState()
 *  Enable the use of enemy placement on the current troop as available reinforcement
 *  slots after they're defeated.
 * 
 * $enrConfig.disableSelfState()
 *  Disable the use of enemy placement on the current troop as available reinforcement
 *  slots after they're defeated.
 * 
 * $enrConfig.resetSelfState()
 *  Returns self state to the default config defined in the plugin parameters.
 * 
 * $enrConfig.isAnimationEnabled()
 *  Returns true if animations on calling a reinforcement is enabled, or false
 *  if it's not.
 * 
 * $enrConfig.enableAnimation()
 *  Turn on animation display when a reinforcement is called into the battlefield.
 * 
 * $enrConfig.disableAnimation()
 *  Turn off animation display when a reinforcements is called into the battlefield.
 * 
 * $enrConfig.resetAnimationEnabled()
 *  Reset to default parameters config if animation on reinforcement call is enabled
 *  or not.
 * 
 * $enrConfig.summonAnimation()
 *  Returns the animation ID configured to run when a reinforcement is called into
 *  the battlefield.
 * 
 * $enrConfig.setSummonAnimation(animationId)
 *  Change the animation to use when an enemy reinforcement is called into the
 *  battlefield.
 * 
 * $enrConfig.resetSummonAnimation()
 *  Restore default configured animation to play when a reinforcement is called.
 * 
 * $enrConfig.entranceDelay()
 *  Returns the configured time (in frames) to wait after calling a reinforcement
 *  and it actually starting to appear on the battlefield.
 * 
 * $enrConfig.updateEntranceDelay(delay)
 *  Update configured delay in frames with the provided value.
 * 
 * $enrConfig.resetEntranceDelay()
 *  Restore default delay value as configured in the plugin parameters.
 * 
 * $enrConfig.entranceType()
 *  Returns the current entrance type configured. See plugin help for the list
 *  of possible values.
 * 
 * $enrConfig.updateEntrance(type)
 *  Update the currently configured entrance type. The provided type is case sensitive
 *  and must be spelled exactly like displayed in the plugin parameters.
 * 
 * $enrConfig.resetEntrance()
 *  Reset entrance type to default value, set in the plugin parameters.
 * 
 * $enrConfig.entranceDuration()
 *  Returns the number of frames it takes for the summoned enemy to appear on the 
 *  screen (turning from full transparent to full opaque).
 * 
 * $enrConfig.updateEntranceDuration(duration)
 *  Updates the currently configured entrance duration. The parameter 'duration'
 *  must be a number greater or equals to zero.
 * 
 * $enrConfig.resetEntranceDuration()
 *  Resets entrance duration to its default value, as configured in the plugin 
 *  parameters.
 * 
 * $enrConfig.resetAll()
 *  Resets all configs to default.
 *  
 * ============================================================================
 * Plugin Commands (MV)
 * ============================================================================
 * 
 * Reinforcement Self Enable
 * Reinforcement Self On
 *  Enable the use of enemy placement on the current troop as available reinforcement
 *  slots after they're defeated.
 * 
 * Reinforcement Self Disable
 * Reinforcement Self Off
 *  Disable the use of enemy placement on the current troop as available reinforcement
 *  slots after they're defeated.
 * 
 * Reinforcement Self Reset
 *  Returns self state to the default config defined in the plugin parameters.
 * 
 * Reinforcement Animation Enable
 * Reinforcement Animation On
 *  Turn on animation display when a reinforcement is called into the battlefield.
 * 
 * Reinforcement Animation Disable
 * Reinforcement Animation Off
 *  Turn off animation display when a reinforcements is called into the battlefield.
 * 
 * Reinforcement Animation Set animationId
 *  Change the animation to use when an enemy reinforcement is called into the
 *  battlefield.
 * 
 * Reinforcement Animation Reset
 *  Restore default configured animation to play when a reinforcement is called.
 * 
 * Reinforcement Entrance Delay Set delayFrames
 *  Update configured delay in frames with the provided value. You can use a variable
 *  to set delay by using the tag \v[variableId].
 * 
 * Reinforcement Entrance Delay Reset
 *  Restore default delay value as configured in the plugin parameters.
 * 
 * Reinforcement Entrance Duration Set durationFrames
 *  Updates the currently configured entrance duration. The parameter 'duration'
 *  must be a number greater or equals to zero.
 * 
 * Reinforcement Entrance Duration Reset
 *  Resets entrance duration to its default value, as configured in the plugin 
 *  parameters. You can use a variable to set duration by using the tag \v[variableId].
 * 
 * Reinforcement Entrance Type Set type
 *  Update the currently configured entrance type. The "type" argument is case
 *  insensitive and must be one of the following supported values:
 *      Spot, Left, Above, Right, Below, None
 * 
 * Reinforcement Entrance Type Reset
 *  Reset entrance type to default value, set in the plugin parameters.
 * 
 * Reinforcement Add enemyId lowerLevel upperLevel
 *  Can only be used during a battle scene. Calls the specified enemyId into battle
 *  using the first reinforcement slot available. You can use a variable to set 
 *  enemyId by using the tag \v[variableId].
 *  lowerLevel and upperLevel are used to define the summoned enemy level range.
 *  They can be omitted if you don't use enemy levels, or if you want the default
 *  enemy level calculation to take place. They can also be variables using the tag
 *  \v[variableId].
 * 
 * Reinforcement Reset
 *  Resets all configs to default values.
 *  
 * ============================================================================
 * Plugin Commands (MZ)
 * ============================================================================
 * 
 * Manage Self State
 *  Enable, disable or reset self state to its original config.
 * 
 * Manage Animations
 *  Enable, disable, set an animation or reset to original config.
 * 
 * Change Entrance Delay
 *  Change or reset entrance delay frames.
 * 
 * Change Entrance Duration
 *  Change or reset entrance duration frames.
 * 
 * Change Entrance Type
 *  Change or reset entrance type.
 * 
 * Add Reinforcements
 *  Call reinforcements into battle.
 * 
 * Reset All Configs
 *  Reset all configs to their default values.
 * 
 * ============================================================================
 * Changelog
 * ============================================================================
 *
 * Version 1.0.0:
 * - Initial release;
 * Version 1.1.0:
 * - Reinforcements now are layered according to its coordinates, preventing a back 
 *   row enemy from appearing over a front row one;
 * - Included some randomness on skill tags, allowing you to set a probability that
 *   a reinforcement summon can succeed;
 * - Added a feature to skill note tags allowing you to specify a level, or level range
 *   for the enemy reinforcements. YEP_EnemyLevels is needed for this feature.
 * - Added the option to use multiple single summon messages when more than one enemy ID
 *   is summoned, or keep using the grouped Multi-Summon Message.
 * Version 1.2.0:
 * - Added MZ compatibility;
 * - Added compatibility and specific features related to TAA_EnemyLevels;
 * - Fixed a bug when a summon were performed with no slots configured for the troop;
 * Version 1.2.1:
 * - Fixed a bug in MZ plugin commands that could cause game crash;
 * - Fixed a bug that could cause reinforcements to not issue any action in MZ's TPB mode;
 * Version 1.2.2:
 * - Fixed a bug that could cause the game to crash upon summoning an enemy;
 * - Added an error handling check to prevent issues with VisuMZ_2_BattleSystemOTB;
 * 
 * ============================================================================
 * End of Help
 * ============================================================================
 * 
 * 
 *
 * =================================================================================
 * Commands (MZ)
 * =================================================================================
 * 
 * @command self
 * @text Manage Self State
 * @desc Enable, disable or reset self state to its original config.
 * 
 * @arg action
 * @text Action
 * @type select
 * @option Enable
 * @option Disable
 * @option Reset
 * @default Enable
 * @desc Select which action to take.
 * 
 * @command animation
 * @text Manage Animations
 * @desc Enable, disable, set an animation or reset to original config.
 * 
 * @arg action
 * @text Action
 * @type select
 * @option Enable
 * @option Disable
 * @option Reset
 * @option Set
 * @default Set
 * @desc Select which action to take.
 * 
 * @arg animationId
 * @text Animation ID
 * @type animation
 * @default 
 * @desc Animation to play at enemy entrance. This param is ignored if action is not 'Set'.
 * 
 * @command entranceDelay
 * @text Change Entrance Delay
 * @desc Change or reset entrance delay frames.
 * 
 * @arg action
 * @text Action
 * @type select
 * @option Set Value
 * @option Set From Variable
 * @option Reset
 * @default Set Value
 * @desc Select which action to take.
 * 
 * @arg value
 * @text Static Value
 * @type number
 * @min 0
 * @default 5
 * @desc Which value to set entrance delay when Action is set to 'Set Value'.
 * 
 * @arg variable
 * @text Variable
 * @type variable
 * @default
 * @desc Which variable to draw the entrance delay value from if Action is set to 'Set From Variable'.
 * 
 * @command entranceDuration
 * @text Change Entrance Duration
 * @desc Change or reset entrance duration frames.
 * 
 * @arg action
 * @text Action
 * @type select
 * @option Set Value
 * @option Set From Variable
 * @option Reset
 * @default Set Value
 * @desc Select which action to take.
 * 
 * @arg value
 * @text Static Value
 * @type number
 * @min 0
 * @default 5
 * @desc Which value to set entrance delay when Action is set to 'Set Value'.
 * 
 * @arg variable
 * @text Variable
 * @type variable
 * @default
 * @desc Which variable to draw the entrance delay value from if Action is set to 'Set From Variable'.
 * 
 * @command entranceType
 * @text Change Entrance Type
 * @desc Change or reset entrance type.
 * 
 * @arg type
 * @text Type
 * @type select
 * @option Enter from Spot
 * @value None
 * @option Enter from Left
 * @value Left
 * @option Enter from Above
 * @value Above
 * @option Enter from Right
 * @value Right
 * @option Enter from Below
 * @value Below
 * @option None
 * @value None
 * @option Reset
 * @value Reset
 * @default Spot
 * @desc Select an entrance type or Reset to rollback to the original default entrance type.
 * 
 * @command addReinforcement
 * @text Add Reinforcements
 * @desc Call reinforcements into battle.
 * 
 * @arg enemyAction
 * @text Enemy Action
 * @type select
 * @option Static ID
 * @option ID from Variable
 * @default Static ID
 * @desc Select where to draw the enemy ID to summon from.
 * 
 * @arg staticId
 * @text Static Enemy ID
 * @type number
 * @min 1
 * @default 1
 * @desc Which enemy ID to call. This parameter is ignored when Action is 'ID from Variable'.
 * 
 * @arg variable
 * @text Variable ID
 * @type variable
 * @default 
 * @desc Which variable value use as enemy ID. This parameter is ignored when Action is 'Static ID'.
 * 
 * @arg lowerLevelType
 * @text Lower Level Range Type
 * @type select
 * @option Ignore
 * @option Static Value
 * @option Variable
 * @default Ignore
 * @desc 'Ignore' will discard any parameters after this. Set if summoned enemy must have a specific level or level range.
 * 
 * @arg lowerRangeValue
 * @text Lower Range Value
 * @type number
 * @min 1
 * @default 1
 * @desc If 'Static Value' is set in the previous param, this value is used as the lower level range.
 * 
 * @arg lowerRangeVar
 * @text Lower Range Variable
 * @type variable
 * @default 
 * @desc Which variable value to use as lower range value. This parameter is ignored if Range Type is set to Static Value.
 * 
 * @arg upperLevelType
 * @text Upper Level Range Type
 * @type select
 * @option Ignore
 * @option Static Value
 * @option Variable
 * @default Ignore
 * @desc 'Ignore' will discard any parameters after this. Set if summoned enemy must have a specific level or level range.
 * 
 * @arg upperRangeValue
 * @text Upper Range Value
 * @type number
 * @min 1
 * @default 1
 * @desc If 'Static Value' is set in the previous param, this value is used as the upper level range.
 * 
 * @arg upperRangeVar
 * @text Upper Range Variable
 * @type variable
 * @default 
 * @desc Which variable value to use as upper range value. This parameter is ignored if Range Type is set to Static Value.
 * 
 * @command globalReset
 * @text Reset All Configs
 * @desc Reset all configs to their default values.
 * 
 * =================================================================================
 * Parameters
 * =================================================================================
 * 
 * @param ---Default Configs---
 * @type text
 * 
 * @param Enable Self State
 * @parent ---Default Configs---
 * @type boolean
 * @on ENABLE
 * @off DISABLE
 * @default true
 * @desc If true, troop units slots will be potential reinforcements if the switch is set to true. If false, when its set to false.
 * 
 * @param Play Summon Animation
 * @parent ---Default Configs---
 * @type boolean
 * @on ENABLE
 * @off DISABLE
 * @default true
 * @desc If true, Summon Animation plays on the enemy sprite as it makes its entrance. If false, no animation is played on summoned enemy.
 * 
 * @param Summon Animation
 * @parent ---Default Configs---
 * @type animation
 * @require 1
 * @default 49
 * @desc Default animation to play when a reinforcement is summoned.
 * 
 * @param Entrance Delay
 * @parent ---Default Configs---
 * @type number
 * @min 0
 * @default 5
 * @desc Number of frames to delay after summoning reinforcements to make it visible on the screen. Use this to time in with animations.
 * 
 * @param Entrance Type
 * @parent ---Default Configs---
 * @type select
 * @option Enter from Spot
 * @option Enter from Left
 * @option Enter from Above
 * @option Enter from Right
 * @option Enter from Below
 * @option None
 * @default Enter from Left
 * @desc How to animate reinforcements entrance in battle. If None, enemy will simply appear on the screen.
 * 
 * @param Entrance Duration
 * @parent ---Default Configs---
 * @type number
 * @min 0
 * @default 30
 * @desc Number of frames that it takes for the enemy to enter the battlefield after it's summoned.
 * 
 * @param Default Slots
 * @parent ---Default Configs---
 * @type text
 * @default
 * @desc List of default slot tags, separated by semicolons. This is ignored if a tag is set for a troop. Ex.: x1,y1; troop z; x2,y2
 * 
 * @param ---Battle Logs---
 * @type text
 * 
 * @param Enable Battle Logs
 * @parent ---Battle Logs---
 * @type boolean
 * @on ENABLE
 * @off DISABLE
 * @default true
 * @desc Enable or disable enemy reinforcements battle logs.
 * 
 * @param Single Summon Message
 * @parent ---Battle Logs---
 * @type text
 * @default %1x %2 answered the call!
 * @desc Message to display when a single enemyId is summoned. %1 - number of enemies. %2 - Enemy Name.
 * 
 * @param Auto Plural
 * @parent ---Battle Logs---
 * @type boolean
 * @on ENABLE
 * @off DISABLE
 * @default true
 * @desc If multiple instances of the same enemy are summoned and this option is enabled, an 's' will be added to the enemy name.
 * 
 * @param Multi-Summon Type
 * @parent ---Battle Logs---
 * @type select
 * @option Individual
 * @option Grouped
 * @default Grouped
 * @desc "Individual" means a Single Summon Message is generated for each unique enemy summoned. "Grouped" causes Multi-Summon Message to be used.
 * 
 * @param Multi-Summon Message
 * @parent ---Battle Logs---
 * @type text
 * @default Many have answered the call!
 * @desc If more than one enemyId has been successfully summoned, display this message instead of the single summon message.
 * 
 * @param Failed Summon Message
 * @parent ---Battle Logs---
 * @type text
 * @default It seems no one have listened...
 * @desc Message to display if a summoning skill has been used but no enemies were summoned.
 * 
 */

TAA.enr.Parameters = TAA.enr.Parameters || {};
var Parameters = PluginManager.parameters(TAA.enr.PluginName);

TAA.enr.Parameters.Default = TAA.enr.Parameters.Default || {};
TAA.enr.Parameters.Default.SelfState = Parameters['Enable Self State'] === 'true';
TAA.enr.Parameters.Default.PlaySummonAnimation = Parameters['Play Summon Animation'] === 'true';
TAA.enr.Parameters.Default.SummonAnimation = parseInt(Parameters['Summon Animation']) || 0;
TAA.enr.Parameters.Default.EntranceDelay = parseInt(Parameters['Entrance Delay']);
TAA.enr.Parameters.Default.Entrance = Parameters['Entrance Type'];
TAA.enr.Parameters.Default.EntranceDuration = parseInt(Parameters['Entrance Duration']);
TAA.enr.Parameters.Default.Slots = Parameters['Default Slots'];

TAA.enr.Parameters.BattleLog = TAA.enr.Parameters.BattleLog || {};
TAA.enr.Parameters.BattleLog.Enabled = Parameters['Enable Battle Logs'] === 'true';
TAA.enr.Parameters.BattleLog.SingleMsg = Parameters['Single Summon Message'];
TAA.enr.Parameters.BattleLog.AutoPlural = Parameters['Auto Plural'] === 'true';
TAA.enr.Parameters.BattleLog.MultiType = Parameters['Multi-Summon Type'];
TAA.enr.Parameters.BattleLog.MultiMsg = Parameters['Multi-Summon Message'];
TAA.enr.Parameters.BattleLog.FailedMsg = Parameters['Failed Summon Message'];

//=============================================================================
// DataManager
//=============================================================================

TAA.enr.alias.DataManager = TAA.enr.alias.DataManager || {};
TAA.enr.alias.DataManager.loadDatabase = DataManager.loadDatabase;
DataManager.loadDatabase = function(){
    $enrConfig = new EnemyReinforcementsConfig();
    return TAA.enr.alias.DataManager.loadDatabase.call(this);
};

TAA.enr.alias.DataManager.makeSaveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function(){
    var contents = TAA.enr.alias.DataManager.makeSaveContents.call(this);
    contents.enrConfig = $enrConfig;
    return contents;
};

TAA.enr.alias.DataManager.extractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents){
    TAA.enr.alias.DataManager.extractSaveContents.call(this, contents);
    $enrConfig = contents.enrConfig;
};

//=============================================================================
// EnemyReinforcementsConfig
//=============================================================================

var $enrConfig = {};

function EnemyReinforcementsConfig() {
    this.initialize.apply(this, arguments);
};

EnemyReinforcementsConfig.prototype.initialize = function(){
    this._selfState = (TAA.enr.Parameters.Default.SelfState == true);
    this._summonAnimation = TAA.enr.Parameters.Default.SummonAnimation;
    this._animationEnabled = TAA.enr.Parameters.Default.PlaySummonAnimation;
    if(isNaN(TAA.enr.Parameters.Default.EntranceDelay) || TAA.enr.Parameters.Default.EntranceDelay < 0)
        this._entranceDelay = 0;
    else
        this._entranceDelay = TAA.enr.Parameters.Default.EntranceDelay;
    this._entranceType = TAA.enr.Parameters.Default.Entrance;
    if(isNaN(TAA.enr.Parameters.Default.EntranceDuration) || TAA.enr.Parameters.Default.EntranceDuration < 0)
        this._entranceDuration = 0;
    else
        this._entranceDuration = TAA.enr.Parameters.Default.EntranceDuration;
    this._defaultSlots = [];
    this.prepareDefaultSlots();
};

EnemyReinforcementsConfig.prototype.prepareDefaultSlots = function(){
    if(TAA.enr.Parameters.Default.Slots === undefined || TAA.enr.Parameters.Default.Slots === '') return;

    this._defaultSlots = TAA.enr.Parameters.Default.Slots.split(";");
};

EnemyReinforcementsConfig.prototype.getDefaultTags = function(){
    return this._defaultSlots;
};

EnemyReinforcementsConfig.prototype.loadReinforcementSlotsFromTroop = function(troopId){
    if(isNaN(troopId) || $dataTroops[troopId] === undefined) return;

    var troop = $dataTroops[troopId];
    troop.members.forEach(function(member) {
        if(!isNaN(member.x) && !isNaN(member.y)){
            this._defaultSlots.push([member.x, member.y]);
        }
    }, this);
};

EnemyReinforcementsConfig.prototype.setSummonAnimation = function(animationId){
    if($dataAnimations[animationId] === undefined) return;
    this._summonAnimation = animationId;
};

EnemyReinforcementsConfig.prototype.selfAsReinforcements = function(){
    return this._selfState;
};

EnemyReinforcementsConfig.prototype.enableSelfState = function(){
    this._selfState = true;
};

EnemyReinforcementsConfig.prototype.disableSelfState = function(){
    this._selfState = false;
};

EnemyReinforcementsConfig.prototype.resetSelfState = function(){
    this._selfState = (TAA.enr.Parameters.Default.SelfState == true);
};

EnemyReinforcementsConfig.prototype.enableAnimation = function(){
    this._animationEnabled = true;
};

EnemyReinforcementsConfig.prototype.disableAnimation = function(){
    this._animationEnabled = false;
};

EnemyReinforcementsConfig.prototype.resetAnimationEnabled = function(){
    this._animationEnabled = (TAA.enr.Parameters.Default.PlaySummonAnimation == true);
};

EnemyReinforcementsConfig.prototype.isAnimationEnabled = function(){
    return this._animationEnabled == true;
};

EnemyReinforcementsConfig.prototype.resetSummonAnimation = function(){
    this._summonAnimation = TAA.enr.Parameters.Default.SummonAnimation;
};

EnemyReinforcementsConfig.prototype.summonAnimation = function(){
    return this._summonAnimation;
};

EnemyReinforcementsConfig.prototype.entranceDelay = function(){
    return this._entranceDelay;
};

EnemyReinforcementsConfig.prototype.updateEntranceDelay = function(delay){
    if(isNaN(delay)) return;
    if(delay <= 0) this._entranceDelay = 0;
    else this._entranceDelay = delay;
};

EnemyReinforcementsConfig.prototype.resetEntranceDelay = function(){
    if(isNaN(TAA.enr.Parameters.Default.EntranceDelay) || TAA.enr.Parameters.Default.EntranceDelay < 0)
        this._entranceDelay = 0;
    else
        this._entranceDelay = TAA.enr.Parameters.Default.EntranceDelay;
};

EnemyReinforcementsConfig.prototype.updateEntrance = function(entrance){
    var types = ['Enter from Spot', 'Enter from Left', 'Enter from Above', 'Enter from Right', 'Enter from Below', 'None'];
    if(types.contains(entrance)){
        this._entranceType = entrance;
    }
};

EnemyReinforcementsConfig.prototype.entranceType = function(){
    return this._entranceType;
};

EnemyReinforcementsConfig.prototype.resetEntrance = function(){
    this._entranceType = TAA.enr.Parameters.Default.Entrance;
};

EnemyReinforcementsConfig.prototype.updateEntranceDuration = function(duration){
    if(isNaN(duration) || duration < 0) return;
    this._entranceDuration = duration;
};

EnemyReinforcementsConfig.prototype.entranceDuration = function(){
    return this._entranceDuration;
};

EnemyReinforcementsConfig.prototype.resetEntranceDuration = function(){
    if(isNaN(TAA.enr.Parameters.Default.EntranceDuration) || TAA.enr.Parameters.Default.EntranceDuration < 0)
        this._entranceDuration = 0;
    else
        this._entranceDuration = TAA.enr.Parameters.Default.EntranceDuration;
};

EnemyReinforcementsConfig.prototype.resetAll = function(){
    this.resetAnimationEnabled();
    this.resetEntrance();
    this.resetEntranceDuration();
    this.resetSelfState();
    this.resetSummonAnimation();
    this.resetEntranceDelay();
};

//=============================================================================
// Game_Interpreter (MV)
//=============================================================================

TAA.enr.alias.Game_Interpreter = TAA.enr.alias.Game_Interpreter || {};
TAA.enr.alias.Game_Interpreter.pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args){
    TAA.enr.alias.Game_Interpreter.pluginCommand.call(this, command, args);
    if(command.toLowerCase() === 'reinforcement' || command.toLowerCase() === 'reinforcements'){
        if(args[0] && args[0].toLowerCase() === 'self'){
            if(args[1] && (args[1].toLowerCase() === 'enable' || args[1].toLowerCase() === 'on')){
                $enrConfig.enableSelfState();
            }
            else if(args[1] && (args[1].toLowerCase() === 'disable' || args[1].toLowerCase() === 'off')){
                $enrConfig.disableSelfState();
            }
            else if(args[1] && args[1].toLowerCase() === 'reset'){
                $enrConfig.resetSelfState();
            }
        }
        else if(args[0] && args[0].toLowerCase() === 'animation'){
            if(args[1] && (args[1].toLowerCase() === 'enable' || args[1].toLowerCase() === 'on')){
                $enrConfig.enableAnimation();
            }
            else if(args[1] && (args[1].toLowerCase() === 'disable' || args[1].toLowerCase() === 'off')){
                $enrConfig.disableAnimation();
            }
            else if(args[1] && args[1].toLowerCase() === 'set'){
                if(args[2] && !isNaN(args[2])){
                    var animationId = parseInt(args[2]);
                    $enrConfig.setSummonAnimation(animationId);
                }
            }
            else if(args[1] && args[1].toLowerCase() === 'reset'){
                $enrConfig.resetSummonAnimation();
            }
        }
        else if(args[0] && args[0].toLowerCase() === 'entrance'){
            if(args[1] && args[1].toLowerCase() === 'delay'){
                if(args[2] && args[2].toLowerCase() === 'set'){
                    if(args[3]){
                        var delay = undefined;
                        if(args[3].match(/\\v\[([0-9]+)\]/i)){
                            delay = $gameVariables.value(parseInt(RegExp.$1));
                        }
                        else if(!isNaN(args[3])){
                            delay = parseInt(args[3]);
                        }
                        if(!isNaN(delay)) $enrConfig.updateEntranceDelay(delay);
                    }
                }
                else if(args[2] && args[2].toLowerCase() === 'reset'){
                    $enrConfig.resetEntranceDelay();
                }
            }
            else if(args[1] && args[1].toLowerCase() === 'duration'){
                if(args[2] && args[2].toLowerCase() === 'set'){
                    if(args[3]){
                        var delay = undefined;
                        if(args[3].match(/\\v\[([0-9]+)\]/i)){
                            delay = $gameVariables.value(parseInt(RegExp.$1));
                        }
                        else if(!isNaN(args[3])){
                            delay = parseInt(args[3]);
                        }
                        if(!isNaN(delay)) $enrConfig.updateEntranceDuration(delay);
                    }
                }
                else if(args[2] && args[2].toLowerCase() === 'reset'){
                    $enrConfig.resetEntranceDuration();
                }
            }
            else if(args[1] && args[1].toLowerCase() === 'type'){
                if(args[2] && args[2].toLowerCase() === 'set'){
                    var type = args[3].charAt(0).toUpperCase() + args[3].slice(1).toLowerCase();
                    if(['Spot', 'Left', 'Right', 'Above', 'Below'].contains(type)){
                        type = 'Enter from ' + type;
                    }
                    $enrConfig.updateEntrance(type);
                }
                else if (args[2] && args[2].toLowerCase() === 'reset'){
                    $enrConfig.resetEntrance();
                }
            }
        }
        else if(args[0] && args[0].toLowerCase() === 'add'){
            if(args[1] && SceneManager._scene.addReinforcement !== undefined){
                var enemyId = undefined;
                var lowerLevel = undefined;
                var upperLevel = undefined;
                if(args[1].match(/\\v\[([0-9]+)\]/i)){
                    enemyId = $gameVariables.value(parseInt(RegExp.$1));
                }
                else if(!isNaN(args[1])){
                    enemyId = parseInt(args[1]);
                }
                if(args[2]){
                    if(args[2].match(/\\v\[([0-9]+)\]/i)){
                        lowerLevel = $gameVariables.value(parseInt(RegExp.$1));
                    }
                    else if(!isNaN(args[2])){
                        lowerLevel = parseInt(args[2]);
                    }
                }
                if(args[3]){
                    if(args[3].match(/\\v\[([0-9]+)\]/i)){
                        upperLevel = $gameVariables.value(parseInt(RegExp.$1));
                    }
                    else if(!isNaN(args[3])){
                        upperLevel = parseInt(args[3]);
                    }
                }
                if(!isNaN(enemyId)) SceneManager._scene.addReinforcement(enemyId, lowerLevel, upperLevel);
            }
        }
        else if(args[0] && args[0].toLowerCase() === 'reset'){
            $enrConfig.resetAll();
        }
    }
};

//=============================================================================
// Plugin Commands (MZ)
//=============================================================================

if(Utils.RPGMAKER_NAME === 'MZ'){
    PluginManager.registerCommand(TAA.enr.PluginName, 'self', args => {
        const action = args.action;
        switch(action.toLowerCase()){
            case 'enable':
                $enrConfig.enableSelfState();
                break;
            case 'disable':
                $enrConfig.disableSelfState();
                break;
            case 'reset':
                $enrConfig.resetSelfState();
                break;
        }
    });

    PluginManager.registerCommand(TAA.enr.PluginName, 'animation', args =>{
        const action = args.action.toLowerCase();
        var id = args.animationId;
        switch(action){
            case 'enable':
                $enrConfig.enableAnimation();
                break;
            case 'disable':
                $enrConfig.disableAnimation();
                break;
            case 'reset':
                $enrConfig.resetSummonAnimation();
                break;
            case 'set':
                if(isNaN(id)) return;
                $enrConfig.setSummonAnimation(parseInt(id));
                break;
        }
    });

    PluginManager.registerCommand(TAA.enr.PluginName, 'entranceDelay', args =>{
        const action = args.action.toLowerCase();
        var value = args.value;
        var variableId = args.variable;
        switch(action){
            case 'set value':
                if(isNaN(value) || value < 0) return;
                $enrConfig.updateEntranceDelay(parseInt(value));
                break;
            case 'set from variable':
                if(isNaN(variableId) || variableId <= 0) return;
                $enrConfig.updateEntranceDelay($gameVariables.value(variableId));
                break;
            case 'reset':
                $enrConfig.resetEntranceDelay();
                break;
        }
    });

    PluginManager.registerCommand(TAA.enr.PluginName, 'entranceDuration', args =>{
        const action = args.action.toLowerCase();
        var value = args.value;
        var variableId = args.variable;
        switch(action){
            case 'set value':
                if(isNaN(value) || value < 0) return;
                $enrConfig.updateEntranceDuration(parseInt(value));
                break;
            case 'set from variable':
                if(isNaN(variableId) || variableId <= 0) return;
                $enrConfig.updateEntranceDuration($gameVariables.value(variableId));
                break;
            case 'reset':
                $enrConfig.resetEntranceDuration();
                break;
        }
    });

    PluginManager.registerCommand(TAA.enr.PluginName, 'entranceType', args =>{
        const type = args.type;
        if(type === 'Reset'){
            $enrConfig.resetEntrance();
        }
        else{
            if(['Spot', 'Left', 'Right', 'Above', 'Below'].contains(type)){
                type = 'Enter from ' + type;
            }
            $enrConfig.updateEntrance(type);
        }
    });

    PluginManager.registerCommand(TAA.enr.PluginName, 'addReinforcement', args =>{
        const action = args.enemyAction.toLowerCase();
        var enemyId = args.staticId;
        var variable = args.variable;
        var lrType = args.lowerLevelType.toLowerCase();
        var lrValue = args.lowerRangeValue;
        var lrVariable = args.lowerRangeVar;
        var urType = args.upperLevelType.toLowerCase();
        var urValue = args.upperRangeValue;
        var urVariable = args.upperRangeVar;
        if(action === 'static id' && isNaN(enemyId)) return;
        else if(action === 'id from variable' && !isNaN(variable))
            enemyId = $gameVariables.value(variable);
        
        if(lrType === 'ignore') {
            lrValue = undefined;
            urValue = undefined;
        }
        else{
            if(lrType === 'variable'){
                if(!isNaN(lrVariable))
                    lrValue = $gameVariables.value(lrVariable);
                else
                    lrValue = undefined;
            }
            else if(lrType === 'static value' && isNaN(lrValue))
                lrValue = undefined;
            
            if(urType === 'ignore')
                upValue = undefined;
            else{
                if(urType === 'variable'){
                    if(!isNaN(upVariable))
                        urValue = $gameVariables.value(urVariable);
                    else
                        urValue = undefined;
                }
                else if(urType === 'static value' && isNaN(urValue))
                    urValue = undefined;
            }
        }
        SceneManager._scene.addReinforcement(parseInt(enemyId), lrValue, urValue);
    });

    PluginManager.registerCommand(TAA.enr.PluginName, 'globalReset', args =>{
        $enrConfig.resetAll();
    });
}

//=============================================================================
// Game_Enemy
//=============================================================================

TAA.enr.alias.Game_Enemy = TAA.enr.alias.Game_Enemy || {};
TAA.enr.alias.Game_Enemy.setup = Game_Enemy.prototype.setup;
Game_Enemy.prototype.setup = function(enemyId, x, y) {
    TAA.enr.alias.Game_Enemy.setup.call(this, enemyId, x, y);
    this._isReinforcement = false;
};

TAA.enr.alias.Game_Enemy.performCollapse = Game_Enemy.prototype.performCollapse;
Game_Enemy.prototype.performCollapse = function(){
    TAA.enr.alias.Game_Enemy.performCollapse.call(this);
    if(this.isReinforcement()){
        $gameTroop.freeReinforcementSlot($gameTroop._enemies.indexOf(this));
    }
};

Game_Enemy.prototype.becomeReinforcement = function(){
    this._isReinforcement = true;
};

Game_Enemy.prototype.isReinforcement = function(){
    return this._isReinforcement;
};

//=============================================================================
// Game_Troop
//=============================================================================

TAA.enr.alias.Game_Troop = TAA.enr.alias.Game_Troop || {};
TAA.enr.alias.Game_Troop.setup = Game_Troop.prototype.setup;
Game_Troop.prototype.setup = function(troopId) {
    TAA.enr.alias.Game_Troop.setup.call(this, troopId);
    this.createReinforcementSlots();
};

Game_Troop.prototype.createReinforcementSlots = function(){
    this._reinforcementSlots = [];
    this._currentReinforcements = [];
    this._occupiedSlots = [];
    this._reinforcementCount = 0;
    this._selfAsReinforcement = $enrConfig.selfAsReinforcements();
    this._realCalls = {};
    this._summonTriggered = false;
    var startTagPattern = /<TAA_ER>/i;
    var endTagPattern = /<\/TAA_ER>/i;
    var singleLinePattern = /<TAA_ER: (?:(?:[0-9]+,\s*[0-9]+|self (?:on|off)|TROOP\s*[0-9]+);?\s*)+>/gi;
   
    var codeList = $dataTroops[this._troopId].pages[0].list;
    var tagsFound = false;
    var tagsPresent = false;
    var isReinforcementComment = false;
    var i = 0;
    while(i < codeList.length && !tagsFound){
        if(codeList[i].code === 108 || codeList[i].code === 408){
            if(codeList[i].parameters[0].match(startTagPattern))
                isReinforcementComment = true;
            else if(codeList[i].parameters[0].match(endTagPattern)){
                isReinforcementComment = false;
                tagsFound = true;
            }
            else if(isReinforcementComment){
                var slotArray = codeList[i].parameters[0].split(";");
                this.processReinforcementTags(slotArray);
                tagsPresent = true;
            }
            else if(codeList[i].parameters[0].match(singleLinePattern)){
                var slotArray = codeList[i].parameters[0].split(";");
                this.processReinforcementTags(slotArray);
                tagsPresent = true;
            }
        }
        i++;
    }
    if(tagsPresent === false) this.loadDefaultSlots();
    if(this._selfAsReinforcement === true) this.loadSelfReinforcementSlots();
};

Game_Troop.prototype.processReinforcementTags = function(slotArray){
    if(slotArray === undefined || slotArray.length <= 0) return;
    var coordPattern = /([0-9]+),\s*([0-9]+)/g;
    var troopPattern = /TROOP\s*([0-9]+)/i;
    var selfPattern = /self (on|off)/i;

    for(var k=0; k < slotArray.length; k++){
        if(slotArray[k].match(coordPattern)){
            var x = RegExp.$1;
            var y = RegExp.$2;
            this.addReinforcementSlotFromCoordinates(x, y);
        }
        else if(slotArray[k].match(troopPattern)){
            var troopId = RegExp.$1;
            this.loadReinforcementSlotsFromTroop(troopId);
        }
        else if(slotArray[k].match(selfPattern)){
            var command = RegExp.$1;
            if(command.toLowerCase() === 'on') this._selfAsReinforcement = true;
            else if(command.toLowerCase() === 'off') this._selfAsReinforcement = false;
        }
    }
};

Game_Troop.prototype.addReinforcementSlotFromCoordinates = function(x, y){
    if(!isNaN(x) && !isNaN(y))
        this._reinforcementSlots.push([parseInt(x), parseInt(y)]);
};

Game_Troop.prototype.loadReinforcementSlotsFromTroop = function(troopId){
    if(isNaN(troopId) || $dataTroops[troopId] === undefined) return;

    var troop = $dataTroops[troopId];
    troop.members.forEach(function(member) {
        if(!isNaN(member.x) && !isNaN(member.y)){
            this._reinforcementSlots.push([member.x, member.y]);
        }
    }, this);
};

Game_Troop.prototype.loadSelfReinforcementSlots = function(){
    for(var i=0; i < this._enemies.length; i++){
        var x = this._enemies[i]._screenX;
        var y = this._enemies[i]._screenY;

        this._reinforcementSlots.push([x,y]);
        var occupiedSlot = this._reinforcementSlots.length;
        this._currentReinforcements.push([i, occupiedSlot]);
        this._occupiedSlots.push(occupiedSlot);
        this._enemies[i]._isReinforcement = true;
        this._reinforcementCount++;
    }
};

Game_Troop.prototype.loadDefaultSlots = function(){
    this.processReinforcementTags($enrConfig.getDefaultTags());
};

Game_Troop.prototype.addReinforcement = function(enemyId, lowerLevel, upperLevel){
    var slot = this.getNextReinforcementSlot();
    if(slot === undefined) return;
    var enemy = new Game_Enemy(enemyId, slot[0], slot[1]);
    enemy = this.setupReinforcementLevel(enemy, lowerLevel, upperLevel);
    enemy.becomeReinforcement();
    var table = this.letterTable();
    var name = enemy.originalName();
    if(enemy.isLetterEmpty()){
        var n = this._namesCount[name] || 0;
        enemy.setLetter(table[n % table.length]);
        this._namesCount[name] = n + 1;
        if(this._namesCount[name] >= 2){
            enemy.setPlural(true);
        }
    }
	enemy.onBattleStart(false);
    this._enemies.push(enemy);
    var occupiedSlot = this._reinforcementSlots.indexOf(slot);
    this._currentReinforcements.push([this._enemies.indexOf(enemy), occupiedSlot]);
    this._occupiedSlots.push(occupiedSlot);
    this._reinforcementCount++;
    return enemy;
};

Game_Troop.prototype.setupReinforcementLevel = function(enemy, lowerLevel, upperLevel){
    if(Imported.YEP_EnemyLevels === true){
        if(lowerLevel >= 1){
            enemy._minLevelCap = lowerLevel;
        }
        if(upperLevel >= lowerLevel){
            enemy._maxLevelCap = upperLevel;
        }
        else{
            enemy._maxLevelCap = (enemy._maxLevelCap <= enemy._minLevelCap) ? enemy._minLevelCap : enemy._maxLevelCap;
        }
        var level = Math.floor(Math.random() * (upperLevel - lowerLevel) + lowerLevel);
        enemy.changeLevel(level);
    }
    else if(TAA.el !== undefined && parseFloat(TAA.el.Version.replace(/\.(\d+)$/, '$1')) > 1.0){
        // Required function from TAA_EnemyLevels was not present until version 1.1.0
        if(!isNaN(lowerLevel)){
            if(lowerLevel === upperLevel || isNaN(upperLevel))
                var level = parseInt(lowerLevel);
            else
                var level = Math.floor(Math.random() * (upperLevel - lowerLevel) + lowerLevel);
            enemy.updateOriginalLevel(level);
        }
    }
    return enemy;
};

Game_Troop.prototype.getNextReinforcementSlot = function(){
    if(this.availableReinforcementSlotsCount() <= 0) return undefined;
    
    for(var i = 0; i < this._reinforcementSlots.length; i++){
        if(!this._occupiedSlots.contains(i)){
            return this._reinforcementSlots[i];
        }
    }
    return undefined;
};

Game_Troop.prototype.availableReinforcementSlotsCount = function(){
    var count = this._reinforcementSlots.length - this._occupiedSlots.length;
    return count;
};

Game_Troop.prototype.freeReinforcementSlot = function(enemyIndex){
    var slotFound = false;
    var i = 0;
    while(i < this._currentReinforcements.length && slotFound === false){
        if(this._currentReinforcements[i] !== undefined && this._currentReinforcements[i] !== null && this._currentReinforcements[i][0] === enemyIndex){
            var slot = this._currentReinforcements[i][1];
            this._currentReinforcements.splice(i, 1);
            this._reinforcementCount--;
            this._occupiedSlots.splice(this._occupiedSlots.indexOf(slot), 1);
            slotFound = true;
        }
        i++;
    }
};

Game_Troop.prototype.clearSummonFlags = function(){
    this._realCalls = {};
    this._summonTriggered = false;
};

Game_Troop.prototype.saveAnsweredCalls = function(realCalls){
    this._realCalls = realCalls;
};

Game_Troop.prototype.getAnsweredCalls = function(){
    return this._realCalls;
};

Game_Troop.prototype.flagReinforcement = function(){
    this._summonTriggered = true;
};

Game_Troop.prototype.hasSuccessfulSummons = function(){
    return this._summonTriggered;
};

//=============================================================================
// Scene_Battle
//=============================================================================

TAA.enr.alias.Scene_Battle = TAA.enr.alias.Scene_Battle || {};
TAA.enr.alias.Scene_Battle.initialize = Scene_Battle.prototype.initialize;
Scene_Battle.prototype.initialize = function(){
    TAA.enr.alias.Scene_Battle.initialize.call(this);
    this._summonedReinforcements = [];
};

Scene_Battle.prototype.addReinforcement = function(enemyId, lowerLevel, upperLevel){
    var enemy = $gameTroop.addReinforcement(enemyId, lowerLevel, upperLevel);
    if(enemy === undefined) return;
    this.setupReinforcementEntrance(enemy);
};

Scene_Battle.prototype.setupReinforcementEntrance = function(enemy){
    switch($enrConfig.entranceType()){
        case 'Enter from Left':
            enemy._reinforcementEntrance = 4;
            break;
        case 'Enter from Above':
            enemy._reinforcementEntrance = 8;
            break;
        case 'Enter from Right':
            enemy._reinforcementEntrance = 6;
            break;
        case 'Enter from Below':
            enemy._reinforcementEntrance = 2;
            break;
        case 'Enter from Spot':
            enemy._reinforcementEntrance = 5;
            break;
        default:
            break;
    }
        
    var summon = [$enrConfig.entranceType(), $enrConfig.entranceDelay()];
    if(enemy !== undefined && !isNaN(enemy._screenX) && !isNaN(enemy._screenY)){
        summon[2] = this._spriteset.addReinforcement(enemy);
        summon[3] = $enrConfig.entranceDuration();
        summon[4] = false;
        this._summonedReinforcements.push(summon);
    }
};

TAA.enr.alias.Scene_Battle.update = Scene_Battle.prototype.update;
Scene_Battle.prototype.update = function() {
    TAA.enr.alias.Scene_Battle.update.call(this);
    if(this._summonedReinforcements.length !== undefined && this._summonedReinforcements.length > 0){
        var i = 0;
        while(i<this._summonedReinforcements.length){
            var length = this._summonedReinforcements.length;
            if($enrConfig.isAnimationEnabled()){
                if($enrConfig.summonAnimation() > 0 && this._summonedReinforcements[i][4] === false){
                    if(Utils.RPGMAKER_NAME === 'MZ')
                        $gameTemp.requestAnimation([this._summonedReinforcements[i][2]._enemy], $enrConfig.summonAnimation(), false);
                    else
                        this._summonedReinforcements[i][2]._enemy.startAnimation($enrConfig.summonAnimation(), false, 0);
                    this._summonedReinforcements[i][4] = true;
                }
                if(this._summonedReinforcements[i][1] >= 0) this._summonedReinforcements[i][1]--;
            }
            this.updateSummonPlacement(i);

            if(length === this._summonedReinforcements.length) i++;
        }
    }
};

Scene_Battle.prototype.updateSummonPlacement = function(index){
    var d = this._summonedReinforcements[index][3];
    var sprite = this._summonedReinforcements[index][2];
    var enemy = sprite._enemy;
    switch(enemy._reinforcementEntrance){
        case 4:
        case 8:
            enemy._screenX = enemy._screenX + (enemy._targetX - enemy._screenX) / d;
            enemy._screenY = enemy._screenY + (enemy._targetY - enemy._screenY) / d;
            break;
        case 2:
        case 5:
        case 6:
            enemy._screenX = enemy._screenX - (enemy._screenX - enemy._targetX) / d;
            enemy._screenY = enemy._screenY - (enemy._screenY - enemy._targetY) / d;
            break;
        default:
            break;
    }
    if(this._summonedReinforcements[index][1] <= 0 || !$enrConfig.isAnimationEnabled())
        sprite.alpha += (1 - sprite.alpha) / d;
    sprite._enemy = enemy;
    sprite._homeX = enemy._screenX;
    sprite._homeY = enemy._screenY;
    
    this._summonedReinforcements[index][3]--;
    if(this._summonedReinforcements[index][3] === 0) {
        this._summonedReinforcements.splice(index, 1);
    };
};

//=============================================================================
// Spriteset_Battle
//=============================================================================

Spriteset_Battle.prototype.addReinforcement = function(enemy){
    var sprite = new Sprite_Enemy(enemy);
    switch(enemy._reinforcementEntrance){
        case 4:
            enemy._targetX = enemy._screenX;
            enemy._screenX = 0 - sprite._texture.width;
            enemy._targetY = enemy._screenY;
            sprite._enemy = enemy;
            sprite._homeX = enemy._screenX;
            break;
        case 8:
            enemy._targetY = enemy._screenY;
            enemy._screenY = 0 - sprite._texture.height;
            enemy._targetX = enemy._screenX;
            sprite._enemy = enemy;
            sprite._homeY = enemy._screenY;
            break;
        case 6:
            enemy._targetX = enemy._screenX;
            enemy._screenX = Graphics.width;
            enemy._targetY = enemy._screenY;
            sprite._enemy = enemy;
            sprite._homeX = enemy._screenX;
            break;
        case 2:
            enemy._targetY = enemy._screenY;
            enemy._screenY = Graphics.height;
            enemy._targetX = enemy._screenX;
            sprite._enemy = enemy;
            sprite._homeY = enemy._screenY;
            break;
        case 5:
            enemy._targetY = enemy._screenY;
            enemy._screenY = enemy._screenY + 100;
            enemy._targetX = enemy._screenX;
            sprite._enemy = enemy;
            sprite._homeY = enemy._screenY;
        default:
            break;
    }
    sprite.alpha = 0;
    this.orderReinforcements(sprite);
    return sprite;
};

Spriteset_Battle.prototype.orderReinforcements = function(sprite){
    var battlefieldIndex = this.battlefieldReinforcementIndex(sprite);
    var enemyIndex = this.enemyReinforcementIndex(sprite);
    this._battleField.addChildAt(sprite, battlefieldIndex);
    this._enemySprites.splice(enemyIndex, 0, sprite);
};

Spriteset_Battle.prototype.enemyReinforcementIndex = function(sprite){
    var i = 0;
    var index = this._enemySprites.length;
    while(i < this._enemySprites.length){
        var indexedSprite = this._enemySprites[i];
        var pluginName = (Utils.RPGMAKER_NAME === 'MZ') ? 'batch' : 'sprite';
        if(indexedSprite.pluginName === pluginName && sprite._homeY <= indexedSprite._homeY){
            index = i;
            i += this._enemySprites.length;
        }
        i++
    }
    return index;
};


Spriteset_Battle.prototype.battlefieldReinforcementIndex = function(sprite){
    var i = 0;
    var index = this._battleField.children.length;
    while(i < this._battleField.children.length){
        var indexedSprite = this._battleField.children[i];
        var pluginName = (Utils.RPGMAKER_NAME === 'MZ') ? 'batch' : 'sprite';
        if(indexedSprite.pluginName === pluginName && sprite._homeY <= indexedSprite._homeY){
            index = i;
            i += this._battleField.children.length;
        }
        i++
    }
    return index;
};

Spriteset_Battle.prototype.presentReinforcement = function(sprite){
    var index = this._enemySprites.indexOf(sprite);
    this._enemySprites[index].alpha = 1;
};

//=============================================================================
// Game_Action
//=============================================================================

TAA.enr.alias.GameAction = TAA.enr.alias.GameAction || {};
TAA.enr.alias.GameAction.setSkill = Game_Action.prototype.setSkill;
Game_Action.prototype.setSkill = function(skillId){
    TAA.enr.alias.GameAction.setSkill.call(this, skillId);
    if(this.item() === undefined || this.item() === null)
        return;
    this.item()._reinforcementCalls = [];
    this.processReinforcementTags();
};

Game_Action.prototype.processReinforcementTags = function(){
    var notes = this.item().note.split(/[\r\n]+/);
    if(notes === undefined || notes.length <= 0) return;

    var startTagPattern = /<TAA_ER>/i;
    var endTagPattern = /<\/TAA_ER>/i;
    var singleLinePattern = /<TAA_ER: (?:[0-9]+,[0-9]+(?:,r[0-9]+|,lv[0-9]+(?::[0-9]+)?)*;?)+\s*>/gi;

    var tagsFound = false;
    var parseSkill = false;
    var i = 0;
    while(i < notes.length && !tagsFound){
        if(notes[i].match(startTagPattern))
            parseSkill = true;
        else if(notes[i].match(endTagPattern)){
            parseSkill = false;
            tagsFound = true;
        }
        else if(parseSkill){
            var reinforcementArray = notes[i].split(";");
            this.parseReinforcementArray(reinforcementArray);
        }
        else if(notes[i].match(singleLinePattern)){
            var reinforcementArray = notes[i].split(";");
            this.parseReinforcementArray(reinforcementArray);
        }
        i++;
    }
};

Game_Action.prototype.parseReinforcementArray = function(array){
    if(array === undefined || array.length <= 0) return;
    var summonPattern = /([0-9]+),([0-9]+)/;
    var randomPattern = /r([0-9]+)/i;
    var lvlPattern = /lv([0-9]+)(?::([0-9]+))?/i;

    for(var k=0; k < array.length; k++){
        if(array[k].match(summonPattern)){
            var enemyId = RegExp.$1;
            var summonQtd = RegExp.$2;
            var r = 100;
            var lowerLevel = 0;
            var upperLevel = 0;
            if(array[k].match(randomPattern)){
                r = parseInt(RegExp.$1);
            }
            if(array[k].match(lvlPattern)){
                lowerLevel = parseInt(RegExp.$1);
                upperLevel = parseInt(RegExp.$2);
                if(isNaN(upperLevel)) upperLevel = lowerLevel;
            }
            this.item()._reinforcementCalls.push([parseInt(enemyId), parseInt(summonQtd), r, lowerLevel, upperLevel]);
        }
    }
};

TAA.enr.alias.GameAction.apply = Game_Action.prototype.apply;
Game_Action.prototype.apply = function(target){
    $gameTroop.clearSummonFlags();
    TAA.enr.alias.GameAction.apply.call(this, target);
    this.processReinforcementCalls(target);
};

Game_Action.prototype.processReinforcementCalls = function(target){
    if(SceneManager._scene.addReinforcement === undefined || this.item()._reinforcementCalls === undefined) return;
    var array = this.item()._reinforcementCalls;
    var realCalls = {};
    if(this.item()._reinforcementCalls.length > 0) $gameTroop.flagReinforcement();
    for(var i=0; i < array.length; i++){
        var enemyId = array[i][0];
        var n = array[i][1];
        var r = array[i][2];
        var lowerLevel = array[i][3];
        var upperLevel = array[i][4];
        while(n > 0){
            if($gameTroop.availableReinforcementSlotsCount() > 0){
                var randomValue = Math.random() * 100;
                if(r >= randomValue){                
                    SceneManager._scene.addReinforcement(enemyId, lowerLevel, upperLevel);
                    realCalls[enemyId] = realCalls[enemyId] || 0;
                    realCalls[enemyId]++;
                }
                n--;
            }
            else n = 0;
        }
    }
    $gameTroop.saveAnsweredCalls(realCalls);
    if(realCalls !== {}) this.makeSuccess(target);
};

//=============================================================================
// Window_BattleLog
//=============================================================================

TAA.enr.alias.Window_BattleLog = TAA.enr.alias.Window_BattleLog || {};
TAA.enr.alias.Window_BattleLog.displayActionResults = Window_BattleLog.prototype.displayActionResults;
Window_BattleLog.prototype.displayActionResults = function(subject, target) {
    TAA.enr.alias.Window_BattleLog.displayActionResults.call(this, subject, target);
    if(TAA.enr.Parameters.BattleLog.Enabled === false) return;
    var calls = $gameTroop.getAnsweredCalls();
    if (target.result().used) {
        this.push('pushBaseLine');
        if(calls !== undefined && Object.keys(calls).length > 0){
            this.displaySummonResults(calls);
        }
        else if($gameTroop.hasSuccessfulSummons()){
            this.displaySummonFailed();
        }
        this.push('waitForNewLine');
        this.push('popBaseLine');
    }
};

Window_BattleLog.prototype.displaySummonResults = function(calls){
    var keys = Object.keys(calls);
    var msg = "";
    if(keys.length === 1 || (keys.length > 1 && TAA.enr.Parameters.BattleLog.MultiType === 'Individual')){
        for(var i=0; i<keys.length; i++){
            msg = "";
            var name = $dataEnemies[keys[i]].name;
            if(TAA.enr.Parameters.BattleLog.AutoPlural === true && calls[keys[i]] > 1) name += 's';
            msg = TAA.enr.Parameters.BattleLog.SingleMsg.replace(/%1/g, calls[keys[i]]);
            msg = msg.replace(/%2/g, name);
            this.push("addText", msg);
        }
    }
    else{
            msg = TAA.enr.Parameters.BattleLog.MultiMsg;
            this.push("addText", msg);
    }
};

Window_BattleLog.prototype.displaySummonFailed = function(){
    if(TAA.enr.Parameters.BattleLog.FailedMsg.length > 0){
        this.push("addText", TAA.enr.Parameters.BattleLog.FailedMsg);
    }
};