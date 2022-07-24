const apiKey = 'c23b746d074135dc9500c0a61300a3cb7647e53ec2b9b658e'

export default async () => {
  const wordRequest = await fetch(`https://api.wordnik.com/v4/words.json/randomWord?api_key=${apiKey}&hasDictionaryDef=true`)
  const wordJson = await wordRequest.json()
  const word = wordJson.word

  const definitionRequest = await fetch(`https://api.wordnik.com/v4/word.json/${word}/definitions?limit=2&api_key=${apiKey}`)
  const definitionJson = await definitionRequest.json()

  let definition
  try {
    definition = definitionJson[1].text
  } catch (e) {
    definition = definitionJson[0].text
  }
  definition = definition.replaceAll(/<[^<]+?>/gm, '')

  return {
    word,
    definition
  }
}
