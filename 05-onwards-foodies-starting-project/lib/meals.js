import sql from "better-sqlite3";
import slugify from "slugify";
import xss from "xss";
import fs from "node:fs";

const db = sql("meals.db");

export async function getMeals() {
  await new Promise((resolve) => setTimeout(resolve, 500));

  //throw new Error("l");
  return db.prepare("SELECT * FROM meals").all();
}

export function getMeal(slug) {
  return db.prepare("SELECT * FROM meals WHERE slug = ?").get(slug);
}

// 이 함수는 사용자가 제출한 Meal 객체를 데이터베이스에 저장하고, 이미지를 파일로 저장합니다.
export async function saveMeal(meal) {
  // meal.title을 기반 문자열(slug)을 생성. 공백은 -로, 대문자는 소문자로 바뀝니다. 예: "My Awesome Pasta" → "my-awesome-pasta"
  meal.slug = slugify(meal.title, { lower: true });
  // meal.instructions 안의 사용자 입력값에서 악성 스크립트를 제거합니다 (XSS 공격 방지)
  meal.instructions = xss(meal.instructions);

  // 업로드된 이미지의 확장자(예: 'jpg', 'png')를 추출합니다.
  const extension = meal.image.name.split(".").pop();
  // 저장될 이미지 파일명을 slug 기반으로 지정합니다. 예: 'my-awesome-pasta.jpg'
  const fileName = `${meal.slug}.${extension}`;

  // 이미지가 저장될 경로에 쓰기 스트림을 생성합니다.
  const stream = fs.createWriteStream(`public/images/${fileName}`);
  // 브라우저에서 전달받은 이미지 파일을 ArrayBuffer 형태로 변환하고, Node.js Buffer로 변환합니다.
  const bufferedImage = await meal.image.arrayBuffer();

  // 변환된 이미지 데이터를 파일로 씁니다. ArrayBuffer를 Node.js에서 사용 가능한 Buffer 객체로 변환
  stream.write(Buffer.from(bufferedImage), (error) => {
    // 에러가 발생하면 예외를 던져 저장 실패를 알립니다.
    if (error) {
      throw new Error("Saving image failed");
    }
  });
  // 이미지 경로를 meal 객체에 다시 저장합니다. 이는 DB에 저장될 경로입니다.
  meal.image = `/images/${fileName}`;

  // 데이터베이스에 meal 정보를 INSERT합니다. @key 들은 객체의 속성명과 매핑됩니다.
  db.prepare(
    `
    INSERT INTO meals(title, summary, instructions, creator, creator_email, image, slug)
    VALUES (
    @title,@summary,@instructions, @creator, @creator_email, @image,@slug   )
    `
  ).run(meal);
}
//SQL 구문을 준비하고, meal 객체의 속성을 SQL의 @title, @summary 등의 값에 자동으로 매핑하여 실행합니다.
