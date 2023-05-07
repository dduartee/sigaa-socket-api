
export interface INewsProps {
    id: string,
    title: string,
}
export interface INewsData {
    date: Date,
    content: string
}
export interface INewsDTOProps extends INewsProps {
    date?: string,
    content?: string
}
export interface INewsDTO {
    toJSON(): INewsDTOProps;
}
export class NewsDTO implements INewsDTO {
	constructor(public newsProps: INewsProps, public newsData?: INewsData) {}

	toJSON(): INewsDTOProps {
		const date = this.newsData?.date || undefined;
		const content = this.newsData?.content || undefined;
		return {
			id: this.newsProps.id,
			title: this.newsProps.title,
			date: date?.toISOString(),
			content: content
		};
	}
}