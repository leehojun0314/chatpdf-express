const weaviate = require('weaviate-ts-client');
async function createWeaviateSchema() {
	const client = weaviate.client({
		scheme: 'https',
		host: 'talkdocu-cluster-2scjziem.weaviate.network',
	});
	const conversationClass = {
		class: 'Conversation',
		properties: [
			{
				dataType: ['string'],
				name: 'fileUrl',
			},
			{
				dataType: ['Page'],
				name: 'pages',
			},
		],
	};

	const pageClass = {
		class: 'Page',
		properties: [
			{
				dataType: ['int'],
				name: 'pageNumber',
			},
			{
				dataType: ['Paragraph'],
				name: 'paragraphs',
			},
			{
				dataType: ['Conversation'],
				name: 'belongsToConversation',
			},
		],
	};

	const paragraphClass = {
		class: 'Paragraph',
		properties: [
			{
				dataType: ['string'],
				name: 'paragraph_content',
			},
			{
				dataType: ['int'],
				name: 'order_number',
			},
			{
				dataType: ['Page'],
				name: 'belongsToPage',
			},
		],
	};

	try {
		await client.schema.createClass(conversationClass);
		await client.schema.createClass(pageClass);
		await client.schema.createClass(paragraphClass);
	} catch (error) {
		console.error('Error creating Weaviate schema:', error);
	}
}
