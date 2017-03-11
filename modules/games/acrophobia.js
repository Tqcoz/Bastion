/*
 * Copyright (C) 2017 Sankarsan Kampa
 *                    https://sankarsankampa.com/contact
 *
 * This file is a part of Bastion Discord BOT.
 *                        https://github.com/snkrsnkampa/Bastion
 *
 * This code is licensed under the SNKRSN Shared License. It is free to
 * download, copy, compile, use, study and refer under the terms of the
 * SNKRSN Shared License. You can modify the code only for personal or
 * internal use only. However, you can not redistribute the code without
 * explicitly getting permission fot it.
 *
 * Bastion BOT is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY. See the SNKRSN Shared License for
 * more details.
 *
 * You should have received a copy of the SNKRSN Shared License along
 * with this program. If not, see <https://github.com/snkrsnkampa/Bastion/LICENSE>.
 */

const getRandomInt = require('../../functions/getRandomInt').func;
let activeChannels = [];
let usersSubmitted = [];
let usersVoted = [];

exports.run = function(Bastion, message, args) {
  if(!activeChannels.includes(message.channel.id)) {
    activeChannels.push(message.channel.id);

    let charPool = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    let acroLen = getRandomInt(2, 5);
    let acronym = [];
    for (var i = 0; i < acroLen; i++)
      acronym.push(charPool[getRandomInt(0, charPool.length - 1)]);

    message.channel.sendMessage('', {embed: {
      color: 5088314,
      title: 'Acrophobia',
      description: `Game started by ${message.author}. Create a sentence with this acronym: **${acronym.join('. ')}.**`,
      footer: {
        text: `You have ${2} minutes to make your submission.`
      }
    }}).then(msg => {
      const collector = msg.channel.createCollector(
        m => !m.author.bot && m.content.split(' ').length == acroLen && matchAcronym(acronym, m.content.split(' ')) && !usersSubmitted.includes(m.author),
        { time: 2 * 60 * 1000 }
      );
      collector.on('message', (msg, sentences) => {
        msg.delete().catch(e => {
          Bastion.log.error(e.stack);
        });
        msg.channel.sendMessage('', {embed: {
          color: 5088314,
          description: `${msg.author} made their submission.`,
          footer: {
            text: `${sentences.collected.size} submissions in total.`
          }
        }}).then(m => {
          usersSubmitted.push(msg.author);
          m.delete(5000);
        }).catch(e => {
          Bastion.log.error(e.stack);
        });
      });
      collector.on('end', (collection, reason) => {
        if (collection.size == 0) {
          message.channel.sendMessage('', {embed: {
            color: 13380644,
            title: 'Acrophobia',
            description: 'Game ended. Unfortunately, no submissions were made for this acronym.'
          }}).then(() => {
            activeChannels = activeChannels.slice(activeChannels.indexOf(message.channel.id)+1, 1);
            msg.delete().catch(e => {
              Bastion.log.error(e.stack);
            });
          }).catch(e => {
            Bastion.log.error(e.stack);
          });
        }
        else {
          let submissions = [];
          for (var i = 0; i < collection.size; i++)
          submissions.push(`**${i+1}.** ${collection.map(a => a.content)[i]}`);
          msg.channel.sendMessage('', {embed: {
            color: 5088314,
            title: 'Acrophobia',
            description: 'Submissions closed',
            fields: [
              {
                name: `Submitted sentences for ${acronym.join('. ')}.:`,
                value: submissions.join('\n')
              }
            ],
            footer: {
              text: 'Vote by typing the corresponding number of a sentence. You have 60 seconds to vote.'
            }
          }}).then(subMsg => {
            const votesCollector = msg.channel.createCollector(
              m => !m.author.bot && parseInt(m.content) > 0 && parseInt(m.content) <= collection.size && !usersVoted.includes(m.author),
              { time: 60 * 1000 }
            );
            msg.delete().catch(e => {
              Bastion.log.error(e.stack);
            });
            votesCollector.on('message', (m, votes) => {
              m.delete();
              m.channel.sendMessage('', {embed: {
                color: 6651610,
                description: `Thank you, ${m.author}, for voting.`,
                footer: {
                  text: `${votes.collected.size} votes in total.`
                }
              }}).then(m => {
                usersVoted.push(m.author);
                m.delete(5000).catch(e => {
                  Bastion.log.error(e.stack);
                });
              });
            });
            votesCollector.on('end', votes => {
              if (votes.size == 0) {
                msg.channel.sendMessage('', {embed: {
                  color: 13380644,
                  title: 'Acrophobia',
                  description: 'Game ended. Unfortunately, no votes were given for any submissions.'
                }}).then(() => {
                  usersSubmitted = [];
                  activeChannels = activeChannels.slice(activeChannels.indexOf(message.channel.id)+1, 1)
                  subMsg.delete().catch(e => {
                    Bastion.log.error(e.stack);
                  });
                }).catch(e => {
                  Bastion.log.error(e.stack);
                });
              }
              else {
                total = votes.size;
                votes = votes.map(v => v.content);
                for (let i = collection.size; i > 0; i--) votes.unshift(`${i}`);
                let count = {};
                for (var i = 0; i < votes.length; i++) count[votes[i]] = count[votes[i]] ? count[votes[i]]+1 : 1;
                let winningVoteIndex = Object.keys(count).reduce(function(a, b){ return count[a] > count[b] ? a : b });
                msg.channel.sendMessage('', {embed: {
                  color: 6651610,
                  title: 'Acrophobia',
                  description: `Game Ended. ${collection.map(s => s.author)[winningVoteIndex - 1]} won by ${count[winningVoteIndex] - 1} of ${votes.length - collection.size} votes`,
                  fields: [
                    {
                      name: 'Winning submission',
                      value: collection.map(s => s.content)[winningVoteIndex - 1]
                    }
                  ]
                }}).then(m => {
                  usersVoted = [];
                  usersSubmitted = [];
                  activeChannels = activeChannels.slice(activeChannels.indexOf(message.channel.id)+1, 1);
                  subMsg.delete().catch(e => {
                    Bastion.log.error(e.stack);
                  });
                }).catch(e => {
                  Bastion.log.error(e.stack);
                });
              }
            });
          }).catch(e => {
            Bastion.log.error(e.stack);
          });
        }
      });
    }).catch(e => {
      Bastion.log.error(e.stack);
    });
  }
  else {
    message.channel.sendMessage('', {embed: {
      color: 13380644,
      description: `Can\'t start an acrophobia now. Another acrophobia game is already running in this channel.\nPlease wait for it to end, or wait for 3 mins to end it automatically.`
    }}).catch(e => {
      Bastion.log.error(e.stack);
    });
  }
};

exports.conf = {
  aliases: ['acro']
};

exports.help = {
  name: 'acrophobia',
  description: 'Starts a acrophobia game. The user will have to make a sentence from the given acronym within 2 minutes. After the submission is done, users can vote for the best sentence, the sentence to get highest no. of votes win.',
  permission: '',
  usage: ['acrophobia']
};

function matchAcronym(charPool, strArr) {
  for (var i = 0; i < charPool.length; i++)
    if (charPool[i] != strArr[i].charAt(0).toUpperCase())
      return false;
  return true;
};